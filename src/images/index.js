import * as Util from '../util'

const resolvePath = (path) => {
  return Util.resolvePath(path);
};

const ArrowBackWhiteImage = resolvePath("images/common/arrow_back_white_24dp.svg");
const CloudBlackImage = resolvePath("images/common/cloud_black_24dp.svg");
const CloudWhiteImage = resolvePath("images/common/cloud_white_24dp.svg");
const CloudDownloadBlackImage = resolvePath("images/common/cloud_download_black_24dp.svg");
const CloudDownloadWhiteImage = resolvePath("images/common/cloud_download_white_24dp.svg");
const DeleteForeverBlackImage = resolvePath("images/common/delete_forever_black_24dp.svg");
const DeleteForeverWhiteImage = resolvePath("images/common/delete_forever_white_24dp.svg");
const DescriptionBlackImage = resolvePath("images/common/description_black_24dp.svg");
const DescriptionWhiteImage = resolvePath("images/common/description_white_24dp.svg");
const AddCircleBlackImage = resolvePath("images/common/add_circle_outline_black_24dp.svg");
const AddCircleWhiteImage = resolvePath("images/common/add_circle_outline_white_24dp.svg");
const PlayArrowBlackImage = resolvePath("images/common/play_arrow_black_24dp.svg");
const PlayArrowWhiteImage = resolvePath("images/common/play_arrow_white_24dp.svg");
const VolumeOffBlackImage = resolvePath("images/common/volume_off_black_24dp.svg");
const WebrcadeLogoDarkImage = resolvePath("images/common/webrcade-logo-dark.svg");
const WebrcadeLogoLargeImage = resolvePath("images/common/webrcade-logo-large.svg");
const CategoryThumbImage = resolvePath("images/folder.png");
const CategoryBackgroundImage = resolvePath("images/folder-background.png");
const FeedThumbImage = resolvePath("images/feed.png");
const FeedBackgroundImage = resolvePath("images/feed-background.png");

export {
  AddCircleBlackImage,
  AddCircleWhiteImage,
  ArrowBackWhiteImage,
  CategoryThumbImage,
  CategoryBackgroundImage,
  CloudBlackImage,
  CloudWhiteImage,
  CloudDownloadBlackImage,
  CloudDownloadWhiteImage,
  DeleteForeverBlackImage,
  DeleteForeverWhiteImage,
  DescriptionBlackImage,
  DescriptionWhiteImage,
  FeedThumbImage,
  FeedBackgroundImage,
  PlayArrowBlackImage,
  PlayArrowWhiteImage,
  WebrcadeLogoDarkImage,
  WebrcadeLogoLargeImage,
  VolumeOffBlackImage,
  resolvePath as resolveImagePath
}
