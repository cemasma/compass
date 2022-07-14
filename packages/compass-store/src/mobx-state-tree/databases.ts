import type { Instance } from 'mobx-state-tree';
import { getParentOfType, getRoot } from 'mobx-state-tree';
import { cast } from 'mobx-state-tree';
import { flow, toGenerator } from 'mobx-state-tree';
import { types } from 'mobx-state-tree';
import { useEffect } from 'react';
import {
  LoadableModel,
  shouldFetch,
  getServices,
  debounceInflight,
} from '../util';
import type { MongoDBInstanceInfo } from './instance-info';
import type { RootInstance } from './root-store';
import { useRootStoreContext } from './root-store-context';

export const DatabaseStatsModel = types
  .compose(
    'DatabaseStats',
    LoadableModel,
    // NB: Compared to redux where everything needs to be explicitly defined
    // separately, this model definition provides: runtime type assertions,
    // strict typescript types, and default values all defined in one place
    types.model({
      data: types.frozen({
        dataSize: 0,
        storageSize: 0,
        indexSize: 0,
        collectionCount: 0,
        documentCount: 0,
        indexCount: 0,
      }),
    })
  )
  .actions((self) => {
    const fetch = debounceInflight(
      flow(function* () {
        if (!shouldFetch(self.status)) {
          return;
        }
        self.status = self.status === 'Initial' ? 'Fetching' : 'Refreshing';
        try {
          const { dataServiceManager } = getServices(self);
          const ds = yield* toGenerator(
            dataServiceManager.getCurrentConnection()
          );
          // NB: Recursive and requires assertion
          const { name } = getParentOfType(self, DatabaseModel) as {
            name: string;
          };
          const stats = yield* toGenerator(ds.databaseStats(name));
          self.data = {
            dataSize: stats.data_size ?? self.data,
            storageSize: stats.storage_size ?? self.data,
            indexSize: stats.index_size ?? self.data,
            collectionCount: stats.collection_count ?? self.data,
            documentCount: stats.document_count ?? self.data,
            indexCount: stats.index_count ?? self.data,
          };
          self.status = 'Ready';
        } catch (err) {
          self.status = 'Error';
          self.error = (err as Error).message;
          throw err;
        }
      })
    );

    return { fetch };
  });

export type DatabaseStats = Instance<typeof DatabaseStatsModel>;

export const DatabaseModel = types.compose(
  'Database',
  LoadableModel,
  types.model({
    name: types.identifier,
    stats: types.optional(DatabaseStatsModel, {}),
  })
);

export type Database = Instance<typeof DatabaseModel>;

export const DatabasesModel = types
  .compose(
    'Databases',
    LoadableModel,
    types.model({
      items: types.map(DatabaseModel),
    })
  )
  .actions((self) => {
    const fetch = debounceInflight(
      flow(function* () {
        if (!shouldFetch(self.status)) {
          return;
        }
        self.status = self.status === 'Initial' ? 'Fetching' : 'Refreshing';
        try {
          const { dataServiceManager } = getServices(self);
          const ds = yield* toGenerator(
            dataServiceManager.getCurrentConnection()
          );
          const { instance } = getRoot<{ instance: MongoDBInstanceInfo }>(self);
          yield* toGenerator(instance.fetch());
          const items = yield* toGenerator(
            ds.listDatabases({
              nameOnly: true,
              privileges: instance.data?.auth.privileges,
            })
          );
          self.items = cast(
            Object.fromEntries(
              items.map((item) => [item.name, { name: item.name }])
            )
          );
          self.status = 'Ready';
          return ds;
        } catch (err) {
          self.status = 'Error';
          self.error = (err as Error).message;
          throw err;
        }
      })
    );

    return { fetch };
  });

export type Databases = Instance<typeof DatabasesModel>;

export const useDatabases = () => {
  const { databases } = useRootStoreContext();
  useEffect(() => {
    void databases.fetch();
  }, []);
  return databases;
};

export const useDatabaseStats = (databaseName: string) => {
  const databases = useDatabases();
  const db = databases.items.get(databaseName);
  useEffect(() => {
    void db?.stats.fetch();
  }, [db]);
  return db?.stats ?? null;
};
