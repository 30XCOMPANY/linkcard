/**
 * [INPUT]: tw/index View, react-native-reanimated
 * [OUTPUT]: Animated object with CSS-enabled Animated.View
 * [POS]: Animated wrapper — extends Reanimated with CSS-wrapped View
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import * as TW from "./index";
import RNAnimated from "react-native-reanimated";

export const Animated = {
  ...RNAnimated,
  View: RNAnimated.createAnimatedComponent(TW.View),
};
