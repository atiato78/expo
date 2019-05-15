//
//  NSCTorchMode.h
//  NewStoreScanKit
//
//  Created by Marcel Dierkes on 01.08.17.
//  Copyright © 2017 NewStore. All rights reserved.
//

#import <Foundation/Foundation.h>

/**
 Controls the Camera flash behavior.
 */
typedef NS_CLOSED_ENUM(NSUInteger, NSCTorchMode) {
    /**
     The flash is not used at all, even in low-light conditions.
     */
    NSCTorchModeOff = 0,
    /**
     The flash is always on.
     */
    NSCTorchModeOn,
    /**
     The flash is off in default light conditions and on in low light.
     */
    NSCTorchModeAuto
};
