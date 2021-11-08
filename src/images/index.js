import { config } from '../conf'
import { isApp } from '../app'
import { isDev } from '../util'

const resolvePath = (path) => {
  return isDev() ? `${config.getLocalUrl()}/${path}` :
      isApp() ? `../../${path}` : path;
};

const ArrowBackWhiteImage = resolvePath("images/common/arrow_back_white_24dp.svg");
const CloudDownloadBlackImage = resolvePath("images/common/cloud_download_black_24dp.svg");
const CloudDownloadWhiteImage = resolvePath("images/common/cloud_download_white_24dp.svg");
const DeleteForeverBlackImage = resolvePath("images/common/delete_forever_black_24dp.svg");
const DeleteForeverWhiteImage = resolvePath("images/common/delete_forever_white_24dp.svg");
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

export {
  AddCircleBlackImage,
  AddCircleWhiteImage,
  ArrowBackWhiteImage,
  CategoryThumbImage,
  CategoryBackgroundImage,
  CloudDownloadBlackImage,
  CloudDownloadWhiteImage,
  DeleteForeverBlackImage,
  DeleteForeverWhiteImage,
  FeedThumbImage,
  PlayArrowBlackImage,
  PlayArrowWhiteImage,
  WebrcadeLogoDarkImage,
  WebrcadeLogoLargeImage,
  VolumeOffBlackImage,
  resolvePath as resolveImagePath
}
