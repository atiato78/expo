//
//  EXNSEventEmitter.h
//  Exponent
//
//  Created by Stanisław Chmiela on 15/05/2019.
//  Copyright © 2019 650 Industries. All rights reserved.
//

#import "EXScopedEventEmitter.h"

NS_ASSUME_NONNULL_BEGIN

@interface EXAAEventEmitter : EXScopedEventEmitter

- (void)dispatchNewStoreEvent:(NSDictionary *)event;

@end

NS_ASSUME_NONNULL_END
