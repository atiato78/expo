//  Copyright © 2018 650 Industries. All rights reserved.

#import <EXUpdates/EXUpdatesAppController.h>
#import <EXUpdates/EXUpdatesDatabase.h>

#import <sqlite3.h>

NS_ASSUME_NONNULL_BEGIN

@interface EXUpdatesDatabase ()

@property (nonatomic, assign) sqlite3 *db;

@end

static NSString* kEXUpdatesDatabaseErrorDomain = @"EXUpdatesDatabase";
static NSString* kEXUpdatesDatabaseFilename = @"updates.db";

static const int kEXUpdatesDatabaseStatusFailed = 0;
static const int kEXUpdatesDatabaseStatusReady = 1;
static const int kEXUpdatesDatabaseStatusPending = 2;
static const int kEXUpdatesDatabaseStatusUnused = 3;

@implementation EXUpdatesDatabase

# pragma mark - lifecycle

- (void)openDatabase
{
  sqlite3 *db;
  NSURL *dbUrl = [[EXUpdatesAppController updatesDirectory] URLByAppendingPathComponent:kEXUpdatesDatabaseFilename];
  BOOL shouldInitializeDatabase = ![[NSFileManager defaultManager] fileExistsAtPath:[dbUrl path]];
  if (sqlite3_open([[dbUrl absoluteString] UTF8String], &db) != SQLITE_OK) {
    sqlite3_close(db);

    NSError *error;
    [[NSFileManager defaultManager] removeItemAtURL:dbUrl error:&error];
    if (error) {
      [[EXUpdatesAppController sharedInstance] handleErrorWithDomain:kEXUpdatesDatabaseErrorDomain description:@"Could not open or delete existing database" info:@{ NSUnderlyingErrorKey: error } isFatal:YES];
      return;
    } else {
      if (sqlite3_open([[dbUrl absoluteString] UTF8String], &db) != SQLITE_OK) {
        [[EXUpdatesAppController sharedInstance] handleErrorWithDomain:kEXUpdatesDatabaseErrorDomain description:@"Could not open existing or create new database" info:nil isFatal:YES];
        return;
      }
    }
    shouldInitializeDatabase = YES;
  }
  _db = db;
  
  if (shouldInitializeDatabase) {
    [self _initializeDatabase];
  }
}

- (void)closeDatabase
{
  sqlite3_close(_db);
  _db = nil;
}

- (void)dealloc
{
  [self closeDatabase];
}

- (void)_initializeDatabase
{
  if (!_db) {
    [[EXUpdatesAppController sharedInstance] handleErrorWithDomain:kEXUpdatesDatabaseErrorDomain description:@"Missing database handle" info:nil isFatal:YES];
    return;
  }

  NSString *createTableStmts = @"\
   CREATE TABLE \"updates\" (\
   \"id\"  BLOB UNIQUE,\
   \"commit_time\"  INTEGER NOT NULL UNIQUE,\
   \"binary_versions\"  TEXT NOT NULL,\
   \"launch_asset_id\" INTEGER,\
   \"metadata\"  TEXT,\
   \"status\"  INTEGER NOT NULL,\
   \"keep\"  INTEGER NOT NULL,\
   PRIMARY KEY(\"id\")\
   );\
   CREATE TABLE \"assets\" (\
   \"id\"  INTEGER PRIMARY KEY AUTOINCREMENT,\
   \"url\"  TEXT NOT NULL,\
   \"headers\"  TEXT,\
   \"type\"  TEXT NOT NULL,\
   \"metadata\"  TEXT,\
   \"download_time\"  INTEGER NOT NULL,\
   \"relative_path\"  TEXT NOT NULL,\
   \"hash_atomic\"  BLOB NOT NULL,\
   \"hash_content\"  BLOB NOT NULL,\
   \"hash_type\"  INTEGER NOT NULL,\
   \"marked_for_deletion\"  INTEGER NOT NULL\
   );\
  CREATE TABLE \"updates_assets\" (\
   \"update_id\"  BLOB NOT NULL,\
   \"asset_id\" INTEGER NOT NULL\
   );\
   ";

  char *errMsg;
  if (sqlite3_exec(_db, [createTableStmts UTF8String], NULL, NULL, &errMsg) != SQLITE_OK) {
    [[EXUpdatesAppController sharedInstance] handleErrorWithDomain:kEXUpdatesDatabaseErrorDomain description:@"Could not initialize database" info:@{ @"message": [NSString stringWithUTF8String:errMsg] } isFatal:YES];
    sqlite3_free(errMsg);
  };
}

# pragma mark - insert and update

- (void)addUpdateWithId:(NSUUID *)updateId
             commitTime:(NSNumber *)commitTime
         binaryVersions:(NSString *)binaryVersions
               metadata:(NSDictionary * _Nullable)metadata
{
  if (!_db) {
    [[EXUpdatesAppController sharedInstance] handleErrorWithDomain:kEXUpdatesDatabaseErrorDomain description:@"Missing database handle" info:nil isFatal:YES];
    return;
  }
  
  [self _executeSql:@"INSERT INTO \"updates\" (\"id\", \"commit_time\", \"binary_versions\", \"metadata\", \"status\" , \"keep\")\
   VALUES (?1, ?2, ?3, ?4, ?5, 1);"
           withArgs:@[
                      updateId,
                      commitTime,
                      binaryVersions,
                      metadata ?: [NSNull null],
                      @(kEXUpdatesDatabaseStatusPending)
                      ]];
}

- (void)addAssetWithUrl:(NSString *)url
                headers:(NSDictionary * _Nullable)headers
                   type:(NSString *)type
               metadata:(NSDictionary * _Nullable)metadata
           downloadTime:(NSDate *)downloadTime
           relativePath:(NSString *)relativePath
             hashAtomic:(NSString *)hashAtomic
            hashContent:(NSString *)hashContent
               hashType:(int)hashType
               updateId:(NSUUID *)updateId
          isLaunchAsset:(BOOL)isLaunchAsset
{
  if (!_db) {
    [[EXUpdatesAppController sharedInstance] handleErrorWithDomain:kEXUpdatesDatabaseErrorDomain description:@"Missing database handle" info:nil isFatal:YES];
    return;
  }
  
  [self _executeSql:@"INSERT INTO \"assets\" (\"url\", \"headers\", \"type\", \"metadata\", \"download_time\", \"relative_path\", \"hash_atomic\", \"hash_content\" , \"hash_type\", \"marked_for_deletion\")\
   VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 0);"
           withArgs:@[
                      url,
                      headers ?: [NSNull null],
                      type,
                      metadata ?: [NSNull null],
                      [NSNumber numberWithDouble:[downloadTime timeIntervalSince1970]],
                      relativePath,
                      hashAtomic,
                      hashContent,
                      @(hashType)
                      ]];

  NSNumber *rowId = [NSNumber numberWithLongLong:sqlite3_last_insert_rowid(_db)];
  
  [self _executeSql:@"INSERT INTO updates_assets (\"update_id\", \"asset_id\") VALUES (?1, ?2);"
           withArgs:@[
                      updateId,
                      rowId
                      ]];
  
  if (isLaunchAsset) {
    [self _executeSql:@"UPDATE updates SET launch_asset_id = ?1, status = ?2 WHERE id = ?3;"
             withArgs:@[
                        rowId,
                        @(kEXUpdatesDatabaseStatusReady),
                        updateId
                        ]];
  }
}

- (void)markUpdatesForDeletion
{
  // mark currently running update as keep: true
  // and mark all updates with earlier commitTimes as keep: false, status unavailable
  NSUUID *launchedUpdateId = [EXUpdatesAppController sharedInstance].launcher.launchedUpdateId;
  NSAssert(launchedUpdateId, @"launchedUpdateId should be nonnull");

  NSString *sql = [NSString stringWithFormat:@"UPDATE updates SET keep = 1 WHERE id = ?1;\
  UPDATE updates SET keep = 0, status = %i WHERE commit_time < (SELECT commit_time FROM updates WHERE id = ?1);", kEXUpdatesDatabaseStatusUnused];

  [self _executeSql:sql withArgs:@[ launchedUpdateId ]];
}

- (NSArray<NSDictionary *>*)markAssetsForDeletion
{
  // the simplest way to mark the assets we want to delete
  // is to mark all assets for deletion, then go back and unmark
  // those assets in updates we want to keep
  // this is safe as long as we have a lock and nothing else is happening
  // in the database during the execution of this method

  return [self _executeSql:@"BEGIN TRANSACTION;\
   UPDATE assets SET marked_for_deletion = 1;\
   UPDATE assets SET marked_for_deletion = 0 WHERE id IN (\
     SELECT asset_id \
     FROM updates_assets \
     INNER JOIN updates ON updates_assets.update_id = updates.id\
     WHERE updates.keep = 1\
   );\
   COMMIT;\
   SELECT * FROM assets WHERE marked_for_deletion = 1;"
           withArgs:nil];
}

- (void)deleteAssetsWithIds:(NSArray<NSNumber *>*)assetIds
{
  NSMutableArray<NSString *>*assetIdStrings = [NSMutableArray new];
  for (NSNumber *assetId in assetIds) {
    [assetIdStrings addObject:[assetId stringValue]];
  }

  NSString *sql = [NSString stringWithFormat:@"DELETE FROM assets WHERE id IN (%@);",
                   [assetIdStrings componentsJoinedByString:@", "]];
  [self _executeSql:sql withArgs:nil];
}

- (void)deleteUnusedUpdates
{
  [self _executeSql:@"DELETE FROM updates_assets WHERE update_id IN (SELECT id FROM updates WHERE keep = 0);\
   DELETE FROM updates WHERE keep = 0;"
           withArgs:nil];
}

# pragma mark - select

- (NSArray <NSDictionary *>*)launchableUpdates
{
  if (!_db) {
    [[EXUpdatesAppController sharedInstance] handleErrorWithDomain:kEXUpdatesDatabaseErrorDomain description:@"Missing database handle" info:nil isFatal:YES];
    return @[];
  }
  
  NSString *sql = [NSString stringWithFormat:@"SELECT *\
  FROM updates\
  WHERE status = %i;", kEXUpdatesDatabaseStatusReady];
  
  return [self _executeSql:sql withArgs:nil];
}

- (NSURL * _Nullable)launchAssetUrlWithUpdateId:(NSUUID *)updateId
{
  if (!_db) {
    [[EXUpdatesAppController sharedInstance] handleErrorWithDomain:kEXUpdatesDatabaseErrorDomain description:@"Missing database handle" info:nil isFatal:YES];
    return nil;
  }
  
  NSString *sql = @"SELECT relative_path\
  FROM updates\
  INNER JOIN assets ON updates.launch_asset_id = assets.id\
  WHERE updates.id = ?1;";
  
  NSArray <NSDictionary *>* rows = [self _executeSql:sql withArgs:@[ updateId ]];
  
  NSString *path = rows[0][@"relative_path"];
  return [NSURL URLWithString:path relativeToURL:[EXUpdatesAppController updatesDirectory]];
}

- (NSArray <NSDictionary *>*)assetsWithUpdateId:(NSUUID *)updateId
{
  if (!_db) {
    [[EXUpdatesAppController sharedInstance] handleErrorWithDomain:kEXUpdatesDatabaseErrorDomain description:@"Missing database handle" info:nil isFatal:YES];
    return @[];
  }
  
  NSString *sql = @"SELECT relative_path, hash_content\
  FROM assets\
  INNER JOIN updates_assets ON updates_assets.asset_id = assets.id\
  INNER JOIN updates ON updates_assets.update_id = updates.id\
  WHERE updates.id = ?1;";
  
  NSArray <NSDictionary *>* rows = [self _executeSql:sql withArgs:@[ updateId ]];
  
  NSMutableArray *assets = [NSMutableArray arrayWithCapacity:rows.count];
  
  for (NSDictionary *row in rows) {
    NSURL *localUri = [NSURL URLWithString:row[@"relative_path"] relativeToURL:[EXUpdatesAppController updatesDirectory]];
    [assets addObject:@{
                        @"localUri": [localUri absoluteString],
                        @"hash": row[@"hash_content"]
                        }];
  }

  return assets;
}

# pragma mark - helper methods

- (NSArray <NSDictionary *>* _Nullable)_executeSql:(NSString *)sql withArgs:(NSArray * _Nullable)args
{
  sqlite3_stmt *stmt;
  if (sqlite3_prepare_v2(_db, [sql UTF8String], -1, &stmt, NULL) != SQLITE_OK) {
    [[EXUpdatesAppController sharedInstance] handleErrorWithDomain:kEXUpdatesDatabaseErrorDomain description:@"Bad SQLite statement" info:nil isFatal:NO];
    return nil;
  }
  if (args) {
    [self _bindStatement:stmt withArgs:args];
  }

  NSMutableArray *rows = [NSMutableArray arrayWithCapacity:0];
  NSMutableArray *columnNames = [NSMutableArray arrayWithCapacity:0];
  NSString *errorMessage;

  int columnCount = 0;
  BOOL fetchedColumns = NO;
  int result;
  BOOL hasMore = YES;
  while (hasMore) {
    result = sqlite3_step (stmt);
    switch (result) {
      case SQLITE_ROW: {
        if (!fetchedColumns) {
          // get all column names once at the beginning
          columnCount = sqlite3_column_count(stmt);
          
          for (int i = 0; i < columnCount; i++) {
            [columnNames addObject:[NSString stringWithFormat:@"%s", sqlite3_column_name(stmt, i)]];
          }
          fetchedColumns = YES;
        }
        NSMutableDictionary *entry = [NSMutableDictionary dictionary];
        for (int i = 0; i < columnCount; i++) {
          NSObject *columnValue = [self _getValueWithStatement:stmt column:i];
          entry[columnNames[i]] = columnValue;
        }
        [rows addObject:entry];
        break;
      }
      case SQLITE_DONE:
        hasMore = NO;
        break;
      default:
        errorMessage = [[self class] convertSQLiteErrorToString:_db];
        hasMore = NO;
        break;
    }
  }

  sqlite3_finalize(stmt);
  
  if (errorMessage) {
    [[EXUpdatesAppController sharedInstance] handleErrorWithDomain:kEXUpdatesDatabaseErrorDomain description:errorMessage info:nil isFatal:NO];
    return nil;
  }
  
  return rows;
}

- (id)_getValueWithStatement:(sqlite3_stmt *)stmt column:(int)column
{
  int columnType = sqlite3_column_type(stmt, column);
  switch (columnType) {
    case SQLITE_INTEGER:
      return @(sqlite3_column_int64(stmt, column));
    case SQLITE_FLOAT:
      return @(sqlite3_column_double(stmt, column));
    case SQLITE_BLOB:
      return [[NSUUID alloc] initWithUUIDBytes:sqlite3_column_blob(stmt, column)];
    case SQLITE_TEXT:
      return [[NSString alloc] initWithBytes:(char *)sqlite3_column_text(stmt, column)
                                      length:sqlite3_column_bytes(stmt, column)
                                    encoding:NSUTF8StringEncoding];
  }
  return [NSNull null];
}

- (void)_bindStatement:(sqlite3_stmt *)stmt withArgs:(NSArray *)args
{
  [args enumerateObjectsUsingBlock:^(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
    if ([obj isKindOfClass:[NSUUID class]]) {
      uuid_t bytes;
      [((NSUUID *)obj) getUUIDBytes:bytes];
      if (sqlite3_bind_blob(stmt, (int)idx + 1, bytes, 16, SQLITE_TRANSIENT) != SQLITE_OK) {
        [[EXUpdatesAppController sharedInstance] handleErrorWithDomain:kEXUpdatesDatabaseErrorDomain description:@"Could not bind UUID to SQLite statement" info:nil isFatal:NO];
        *stop = YES;
      }
    } else if ([obj isKindOfClass:[NSNumber class]]) {
      if (sqlite3_bind_int64(stmt, (int)idx + 1, [((NSNumber *)obj) longLongValue]) != SQLITE_OK) {
        [[EXUpdatesAppController sharedInstance] handleErrorWithDomain:kEXUpdatesDatabaseErrorDomain description:@"Could not bind number to SQLite statement" info:nil isFatal:NO];
        *stop = YES;
      }
    } else if ([obj isKindOfClass:[NSDictionary class]]) {
      NSError *error;
      NSData *jsonData = [NSJSONSerialization dataWithJSONObject:(NSDictionary *)obj options:kNilOptions error:&error];
      if (!error && sqlite3_bind_text(stmt, (int)idx + 1, jsonData.bytes, (int)jsonData.length, SQLITE_TRANSIENT) != SQLITE_OK) {
        [[EXUpdatesAppController sharedInstance] handleErrorWithDomain:kEXUpdatesDatabaseErrorDomain description:@"Could not bind JSON data to SQLite statement" info:nil isFatal:NO];
        *stop = YES;
      }
    } else if ([obj isKindOfClass:[NSNull class]]) {
      if (sqlite3_bind_null(stmt, (int)idx + 1) != SQLITE_OK) {
        [[EXUpdatesAppController sharedInstance] handleErrorWithDomain:kEXUpdatesDatabaseErrorDomain description:@"Could not bind null arg to SQLite statement" info:nil isFatal:NO];
        *stop = YES;
      }
    } else {
      // convert to string
      NSString *string = [obj isKindOfClass:[NSString class]] ? (NSString *)obj : [obj description];
      NSData *data = [string dataUsingEncoding:NSUTF8StringEncoding];
      if (sqlite3_bind_text(stmt, (int)idx + 1, data.bytes, (int)data.length, SQLITE_TRANSIENT) != SQLITE_OK) {
        [[EXUpdatesAppController sharedInstance] handleErrorWithDomain:kEXUpdatesDatabaseErrorDomain description:@"Could not bind string to SQLite statement" info:nil isFatal:NO];
        *stop = YES;
      }
    }
  }];
}

+ (NSString *)convertSQLiteErrorToString:(struct sqlite3 *)db
{
  int code = sqlite3_errcode(db);
  NSString *message = [NSString stringWithUTF8String:sqlite3_errmsg(db)];
  return [NSString stringWithFormat:@"Error code %i: %@", code, message];
}

@end

NS_ASSUME_NONNULL_END
