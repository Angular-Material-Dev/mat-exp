import * as ts from 'typescript';
import type { ApiJsDocTags, ApiTypeParam } from './types.js';

export function isInternalJsDoc(node: ts.Node): boolean {
  return ts.getJSDocTags(node).some((tag) => tag.tagName.text === 'internal');
}

export function getJsDocDescription(node: ts.Node): string | undefined {
  for (const comment of ts.getJSDocCommentsAndTags(node)) {
    if (!ts.isJSDoc(comment)) continue;
    if (!comment.comment) continue;
    const text =
      typeof comment.comment === 'string'
        ? comment.comment
        : comment.comment.map((c) => ('text' in c ? c.text : '')).join('');
    const trimmed = text.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

export function tagComment(tag: ts.JSDocTag): string {
  if (!tag.comment) return '';
  return typeof tag.comment === 'string'
    ? tag.comment
    : tag.comment.map((c) => ('text' in c ? c.text : '')).join('');
}

export function getJsDocTags(node: ts.Node): ApiJsDocTags {
  const tags = ts.getJSDocTags(node);
  const result: ApiJsDocTags = {};

  for (const tag of tags) {
    const name = tag.tagName.text;
    if (name === 'deprecated') {
      const msg = tagComment(tag).trim();
      result.deprecated = msg || true;
    } else if (name === 'remarks') {
      result.remarks = tagComment(tag).trim() || undefined;
    } else if (name === 'example') {
      result.example = tagComment(tag).trim() || undefined;
    } else if (name === 'see') {
      const link = tagComment(tag).trim();
      if (link) (result.see ??= []).push(link);
    } else if (name === 'metaDescription') {
      result.metaDescription = tagComment(tag).trim() || undefined;
    }
  }
  return result;
}

export function getJsDocParamDescriptions(node: ts.Node): Map<string, string> {
  const map = new Map<string, string>();
  for (const tag of ts.getJSDocTags(node)) {
    if (!ts.isJSDocParameterTag(tag)) continue;
    const paramName = ts.isIdentifier(tag.name) ? tag.name.text : tag.name.right.text;
    const desc = tagComment(tag).trim();
    if (desc) map.set(paramName, desc);
  }
  return map;
}

export function getJsDocDefaultTag(node: ts.Node): string | undefined {
  for (const tag of ts.getJSDocTags(node)) {
    if (tag.tagName.text === 'default' || tag.tagName.text === 'defaultValue') {
      return tagComment(tag).trim() || undefined;
    }
  }
  return undefined;
}

/**
 * Reads `@name <Display Label>` from a playground preview input's JSDoc —
 * an explicit override for the label shown in the playground controls
 * panel, instead of the humanized property name.
 */
export function getJsDocNameTag(node: ts.Node): string | undefined {
  for (const tag of ts.getJSDocTags(node)) {
    if (tag.tagName.text === 'name') {
      return tagComment(tag).trim() || undefined;
    }
  }
  return undefined;
}

/**
 * Reads `@playgroundFor <LibraryClassName>` from a playground preview
 * component's class-level JSDoc. Used to key its extracted inputs into
 * `playground-schemas.json` under the library class the preview stands in for.
 */
export function getPlaygroundForTag(node: ts.Node): string | undefined {
  for (const tag of ts.getJSDocTags(node)) {
    if (tag.tagName.text === 'playgroundFor') {
      return tagComment(tag).trim() || undefined;
    }
  }
  return undefined;
}

export function getJsDocReturnsDescription(node: ts.Node): string | undefined {
  for (const tag of ts.getJSDocTags(node)) {
    if (tag.tagName.text === 'returns' || tag.tagName.text === 'return') {
      return tagComment(tag).trim() || undefined;
    }
  }
  return undefined;
}

export function extractTypeParams(
  typeParameters: ts.NodeArray<ts.TypeParameterDeclaration> | undefined,
  checker: ts.TypeChecker,
): ApiTypeParam[] | undefined {
  if (!typeParameters || typeParameters.length === 0) return undefined;
  return typeParameters.map((tp) => {
    const param: ApiTypeParam = { name: tp.name.text };
    if (tp.constraint)
      param.constraint = checker.typeToString(checker.getTypeAtLocation(tp.constraint));
    if (tp.default) param.default = checker.typeToString(checker.getTypeAtLocation(tp.default));
    return param;
  });
}
