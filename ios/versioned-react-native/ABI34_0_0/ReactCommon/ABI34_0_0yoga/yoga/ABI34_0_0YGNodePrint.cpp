/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the LICENSE
 * file in the root directory of this source tree.
 */
#include "ABI34_0_0YGNodePrint.h"
#include <stdarg.h>
#include "ABI34_0_0YGEnums.h"
#include "ABI34_0_0YGNode.h"
#include "ABI34_0_0Yoga-internal.h"

namespace facebook {
namespace ABI34_0_0yoga {
typedef std::string string;

static void indent(string& base, uint32_t level) {
  for (uint32_t i = 0; i < level; ++i) {
    base.append("  ");
  }
}

static bool areFourValuesEqual(const ABI34_0_0YGStyle::Edges& four) {
  return ABI34_0_0YGValueEqual(four[0], four[1]) && ABI34_0_0YGValueEqual(four[0], four[2]) &&
      ABI34_0_0YGValueEqual(four[0], four[3]);
}

static void appendFormatedString(string& str, const char* fmt, ...) {
  va_list args;
  va_start(args, fmt);
  va_list argsCopy;
  va_copy(argsCopy, args);
  std::vector<char> buf(1 + vsnprintf(NULL, 0, fmt, args));
  va_end(args);
  vsnprintf(buf.data(), buf.size(), fmt, argsCopy);
  va_end(argsCopy);
  string result = string(buf.begin(), buf.end() - 1);
  str.append(result);
}

static void appendFloatOptionalIfDefined(
    string& base,
    const string key,
    const ABI34_0_0YGFloatOptional num) {
  if (!num.isUndefined()) {
    appendFormatedString(base, "%s: %g; ", key.c_str(), num.unwrap());
  }
}

static void appendNumberIfNotUndefined(
    string& base,
    const string key,
    const ABI34_0_0YGValue number) {
  if (number.unit != ABI34_0_0YGUnitUndefined) {
    if (number.unit == ABI34_0_0YGUnitAuto) {
      base.append(key + ": auto; ");
    } else {
      string unit = number.unit == ABI34_0_0YGUnitPoint ? "px" : "%%";
      appendFormatedString(
          base, "%s: %g%s; ", key.c_str(), number.value, unit.c_str());
    }
  }
}

static void appendNumberIfNotAuto(
    string& base,
    const string& key,
    const ABI34_0_0YGValue number) {
  if (number.unit != ABI34_0_0YGUnitAuto) {
    appendNumberIfNotUndefined(base, key, number);
  }
}

static void appendNumberIfNotZero(
    string& base,
    const string& str,
    const ABI34_0_0YGValue number) {
  if (number.unit == ABI34_0_0YGUnitAuto) {
    base.append(str + ": auto; ");
  } else if (!ABI34_0_0YGFloatsEqual(number.value, 0)) {
    appendNumberIfNotUndefined(base, str, number);
  }
}

static void appendEdges(
    string& base,
    const string& key,
    const ABI34_0_0YGStyle::Edges& edges) {
  if (areFourValuesEqual(edges)) {
    appendNumberIfNotZero(base, key, edges[ABI34_0_0YGEdgeLeft]);
  } else {
    for (int edge = ABI34_0_0YGEdgeLeft; edge != ABI34_0_0YGEdgeAll; ++edge) {
      string str = key + "-" + ABI34_0_0YGEdgeToString(static_cast<ABI34_0_0YGEdge>(edge));
      appendNumberIfNotZero(base, str, edges[edge]);
    }
  }
}

static void appendEdgeIfNotUndefined(
    string& base,
    const string& str,
    const ABI34_0_0YGStyle::Edges& edges,
    const ABI34_0_0YGEdge edge) {
  appendNumberIfNotUndefined(
      base,
      str,
      ABI34_0_0YGComputedEdgeValue(edges, edge, detail::CompactValue::ofUndefined()));
}

void ABI34_0_0YGNodeToString(
    std::string& str,
    ABI34_0_0YGNodeRef node,
    ABI34_0_0YGPrintOptions options,
    uint32_t level) {
  indent(str, level);
  appendFormatedString(str, "<div ");
  if (node->getPrintFunc() != nullptr) {
    node->getPrintFunc()(node);
  }

  if (options & ABI34_0_0YGPrintOptionsLayout) {
    appendFormatedString(str, "layout=\"");
    appendFormatedString(
        str, "width: %g; ", node->getLayout().dimensions[ABI34_0_0YGDimensionWidth]);
    appendFormatedString(
        str, "height: %g; ", node->getLayout().dimensions[ABI34_0_0YGDimensionHeight]);
    appendFormatedString(
        str, "top: %g; ", node->getLayout().position[ABI34_0_0YGEdgeTop]);
    appendFormatedString(
        str, "left: %g;", node->getLayout().position[ABI34_0_0YGEdgeLeft]);
    appendFormatedString(str, "\" ");
  }

  if (options & ABI34_0_0YGPrintOptionsStyle) {
    appendFormatedString(str, "style=\"");
    if (node->getStyle().flexDirection != ABI34_0_0YGNode().getStyle().flexDirection) {
      appendFormatedString(
          str,
          "flex-direction: %s; ",
          ABI34_0_0YGFlexDirectionToString(node->getStyle().flexDirection));
    }
    if (node->getStyle().justifyContent != ABI34_0_0YGNode().getStyle().justifyContent) {
      appendFormatedString(
          str,
          "justify-content: %s; ",
          ABI34_0_0YGJustifyToString(node->getStyle().justifyContent));
    }
    if (node->getStyle().alignItems != ABI34_0_0YGNode().getStyle().alignItems) {
      appendFormatedString(
          str,
          "align-items: %s; ",
          ABI34_0_0YGAlignToString(node->getStyle().alignItems));
    }
    if (node->getStyle().alignContent != ABI34_0_0YGNode().getStyle().alignContent) {
      appendFormatedString(
          str,
          "align-content: %s; ",
          ABI34_0_0YGAlignToString(node->getStyle().alignContent));
    }
    if (node->getStyle().alignSelf != ABI34_0_0YGNode().getStyle().alignSelf) {
      appendFormatedString(
          str, "align-self: %s; ", ABI34_0_0YGAlignToString(node->getStyle().alignSelf));
    }
    appendFloatOptionalIfDefined(str, "flex-grow", node->getStyle().flexGrow);
    appendFloatOptionalIfDefined(
        str, "flex-shrink", node->getStyle().flexShrink);
    appendNumberIfNotAuto(str, "flex-basis", node->getStyle().flexBasis);
    appendFloatOptionalIfDefined(str, "flex", node->getStyle().flex);

    if (node->getStyle().flexWrap != ABI34_0_0YGNode().getStyle().flexWrap) {
      appendFormatedString(
          str, "flexWrap: %s; ", ABI34_0_0YGWrapToString(node->getStyle().flexWrap));
    }

    if (node->getStyle().overflow != ABI34_0_0YGNode().getStyle().overflow) {
      appendFormatedString(
          str, "overflow: %s; ", ABI34_0_0YGOverflowToString(node->getStyle().overflow));
    }

    if (node->getStyle().display != ABI34_0_0YGNode().getStyle().display) {
      appendFormatedString(
          str, "display: %s; ", ABI34_0_0YGDisplayToString(node->getStyle().display));
    }
    appendEdges(str, "margin", node->getStyle().margin);
    appendEdges(str, "padding", node->getStyle().padding);
    appendEdges(str, "border", node->getStyle().border);

    appendNumberIfNotAuto(
        str, "width", node->getStyle().dimensions[ABI34_0_0YGDimensionWidth]);
    appendNumberIfNotAuto(
        str, "height", node->getStyle().dimensions[ABI34_0_0YGDimensionHeight]);
    appendNumberIfNotAuto(
        str, "max-width", node->getStyle().maxDimensions[ABI34_0_0YGDimensionWidth]);
    appendNumberIfNotAuto(
        str, "max-height", node->getStyle().maxDimensions[ABI34_0_0YGDimensionHeight]);
    appendNumberIfNotAuto(
        str, "min-width", node->getStyle().minDimensions[ABI34_0_0YGDimensionWidth]);
    appendNumberIfNotAuto(
        str, "min-height", node->getStyle().minDimensions[ABI34_0_0YGDimensionHeight]);

    if (node->getStyle().positionType != ABI34_0_0YGNode().getStyle().positionType) {
      appendFormatedString(
          str,
          "position: %s; ",
          ABI34_0_0YGPositionTypeToString(node->getStyle().positionType));
    }

    appendEdgeIfNotUndefined(
        str, "left", node->getStyle().position, ABI34_0_0YGEdgeLeft);
    appendEdgeIfNotUndefined(
        str, "right", node->getStyle().position, ABI34_0_0YGEdgeRight);
    appendEdgeIfNotUndefined(str, "top", node->getStyle().position, ABI34_0_0YGEdgeTop);
    appendEdgeIfNotUndefined(
        str, "bottom", node->getStyle().position, ABI34_0_0YGEdgeBottom);
    appendFormatedString(str, "\" ");

    if (node->getMeasure() != nullptr) {
      appendFormatedString(str, "has-custom-measure=\"true\"");
    }
  }
  appendFormatedString(str, ">");

  const uint32_t childCount = static_cast<uint32_t>(node->getChildren().size());
  if (options & ABI34_0_0YGPrintOptionsChildren && childCount > 0) {
    for (uint32_t i = 0; i < childCount; i++) {
      appendFormatedString(str, "\n");
      ABI34_0_0YGNodeToString(str, ABI34_0_0YGNodeGetChild(node, i), options, level + 1);
    }
    appendFormatedString(str, "\n");
    indent(str, level);
  }
  appendFormatedString(str, "</div>");
}
} // namespace ABI34_0_0yoga
} // namespace facebook
