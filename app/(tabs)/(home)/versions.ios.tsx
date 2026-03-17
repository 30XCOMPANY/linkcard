/**
 * [INPUT]: expo requireOptionalNativeModule, @/src/screens/home/versions-screen,
 *          @/src/screens/home/versions-native-screen
 * [OUTPUT]: iOS versions route shell selecting native ExpoUI screen when available
 * [POS]: (home) module iOS entrypoint that gates native list behavior on ExpoUI availability
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */

import { requireOptionalNativeModule } from "expo";

import VersionsScreen from "@/src/screens/home/versions-screen";

const ExpoUI = requireOptionalNativeModule("ExpoUI");

const VersionsRoute = ExpoUI
  ? require("@/src/screens/home/versions-native-screen").default
  : VersionsScreen;

export default VersionsRoute;
