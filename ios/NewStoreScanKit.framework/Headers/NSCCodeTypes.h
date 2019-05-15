//
//  NSCCodeTypes.h
//  NewStoreScanKit
//
//  Created by Marcel Dierkes on 29.07.17.
//  Copyright © 2017 NewStore. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/**
 An option set of code types used by the `NSCScanViewController`.
 */
typedef NS_OPTIONS(NSUInteger, NSCCodeTypes) {
    /**
     No code type should be recognized.
     */
    NSCCodeTypeNone NS_SWIFT_UNAVAILABLE("Use [] instead.") = 0,

    /**
     QR codes
     */
    NSCCodeTypeQR NS_SWIFT_NAME(qr) = 1 << 0,

    /**
     Databar codes
     */
    NSCCodeTypeDatabar = 1 << 1,

    /**
     Expanded Databar codes
     */
    NSCCodeTypeDatabarExpanded = 1 << 2,

    /**
     EAN8 codes.
     */
    NSCCodeTypeEAN8 NS_SWIFT_NAME(ean8) = 1 << 3,

    /**
     EAN13 codes.
     */
    NSCCodeTypeEAN13 NS_SWIFT_NAME(ean13) = 1 << 4,

    /**
     UPC-A codes.
     */
    NSCCodeTypeUPCA NS_SWIFT_NAME(upca) = 1 << 5,

    /**
     UPC-E codes.
     */
    NSCCodeTypeUPCE NS_SWIFT_NAME(upce) = 1 << 6,

    /**
     2D DataMatrix codes.
     */
    NSCCodeTypeDataMatrix = 1 << 7,

    /**
     Code39 codes
     */
    NSCCodeTypeCode39 = 1 << 8,

    /**
     Code93 codes
     */
    NSCCodeTypeCode93 = 1 << 9,

    /**
     Code128 codes
     */
    NSCCodeTypeCode128 = 1 << 10,

    /**
     PDF417 codes
     */
    NSCCodeTypePDF417 NS_SWIFT_NAME(pdf417) = 1 << 11,

    /**
     Interleaved 2 of 5 codes
     */
    NSCCodeTypeI25 NS_SWIFT_NAME(interleaved2of5) = 1 << 12,

    /**
     All available codes types
     */
    NSCCodeTypeAll = NSCCodeTypeQR
        | NSCCodeTypeDatabar
        | NSCCodeTypeDatabarExpanded
        | NSCCodeTypeEAN8
        | NSCCodeTypeEAN13
        | NSCCodeTypeUPCA
        | NSCCodeTypeUPCE
        | NSCCodeTypeDataMatrix
        | NSCCodeTypeCode39
        | NSCCodeTypeCode93
        | NSCCodeTypeCode128
        | NSCCodeTypePDF417
        | NSCCodeTypeI25
};

NS_ASSUME_NONNULL_END
