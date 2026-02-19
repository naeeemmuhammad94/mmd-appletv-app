#import <AVFoundation/AVFoundation.h>
#import <AVKit/AVKit.h>
#import <React/RCTBridgeModule.h>

@interface VimeoPlayerModule : NSObject <RCTBridgeModule>
@end

@implementation VimeoPlayerModule

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

/// Play a direct HLS (.m3u8) URL using AVPlayerViewController
RCT_EXPORT_METHOD(playHLS : (NSString *)urlString title : (NSString *)title) {
  NSLog(@"[VimeoPlayer] playHLS called with URL: %@", urlString);

  NSURL *url = [NSURL URLWithString:urlString];
  if (!url) {
    NSLog(@"[VimeoPlayer] Invalid URL: %@", urlString);
    return;
  }

  dispatch_async(dispatch_get_main_queue(), ^{
    [self presentPlayerWithURL:url title:title];
  });
}

- (void)presentPlayerWithURL:(NSURL *)url title:(NSString *)title {
  AVPlayer *player = [AVPlayer playerWithURL:url];
  AVPlayerViewController *playerVC = [[AVPlayerViewController alloc] init];
  playerVC.player = player;

  // Set title metadata for the tvOS info panel
  if (title.length > 0) {
    AVMutableMetadataItem *titleItem = [[AVMutableMetadataItem alloc] init];
    titleItem.identifier = AVMetadataCommonIdentifierTitle;
    titleItem.value = title;
    player.currentItem.externalMetadata = @[ titleItem ];
  }

  // Find the topmost view controller
  UIViewController *rootVC = nil;
  for (UIScene *scene in UIApplication.sharedApplication.connectedScenes) {
    if ([scene isKindOfClass:[UIWindowScene class]]) {
      UIWindowScene *windowScene = (UIWindowScene *)scene;
      rootVC = windowScene.windows.firstObject.rootViewController;
      break;
    }
  }

  if (!rootVC) {
    NSLog(@"[VimeoPlayer] No root view controller found");
    return;
  }

  UIViewController *topVC = rootVC;
  while (topVC.presentedViewController) {
    topVC = topVC.presentedViewController;
  }

  NSLog(@"[VimeoPlayer] Presenting player on %@",
        NSStringFromClass([topVC class]));

  [topVC presentViewController:playerVC
                      animated:YES
                    completion:^{
                      [player play];
                      NSLog(@"[VimeoPlayer] Player is now playing");
                    }];
}

@end
