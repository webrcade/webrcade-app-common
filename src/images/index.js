import { config } from '../conf'
import { isApp } from '../app'
import { isDev } from '../dev'

const resolvePath = (path) => {
  return isDev() ? "http://" + config.getLocalIp() + ":3000/" + path :
      isApp() ? "../../" + path : path;
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


export {
  AddCircleBlackImage,
  AddCircleWhiteImage,
  ArrowBackWhiteImage,
  CloudDownloadBlackImage,
  CloudDownloadWhiteImage,
  DeleteForeverBlackImage,
  DeleteForeverWhiteImage,
  PlayArrowBlackImage,
  PlayArrowWhiteImage,
  WebrcadeLogoDarkImage,
  WebrcadeLogoLargeImage,
  VolumeOffBlackImage
}
