//
//  EXAAEventProxy.h
//  Exponent
//
//  Created by Stanisław Chmiela on 15/05/2019.
//  Copyright © 2019 650 Industries. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface EXAAEventProxy : NSObject

- (void)dispatchEventToAll:(NSDictionary *)event;
- (void)registerEventEmitter:(id)eventEmitter;

@end

NS_ASSUME_NONNULL_END
