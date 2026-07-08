import type * as acorn from 'acorn';
import {
  VarKind,
  getInstrumentedName,
  getLocFromNode,
  header,
  kindToStr,
  locToStr,
  log,
  parse,
  readFile,
  strToKind,
  stringify,
  warn,
  writeFile,
} from '../utils.js';

// -----------------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------------
export function collectIdentifiers(node: acorn.Pattern): string[] {
  const ids: string[] = [];
  function collect(node: acorn.Pattern): void {
    switch (node.type) {
      case 'Identifier':
        ids.push(node.name);
        break;
      case 'ObjectPattern':
        for (const prop of node.properties) {
          switch (prop.type) {
            case 'Property':
              collect(prop.value);
              break;
            case 'RestElement':
              collect(prop.argument);
              break;
          }
        }
        break;
      case 'ArrayPattern':
        for (const elem of node.elements) {
          if (elem != null) {
            switch (elem.type) {
              case 'Identifier':
                ids.push(elem.name);
                break;
              case 'RestElement':
                collect(elem.argument);
                break;
              default:
                collect(elem);
                break;
            }
          }
        }
        break;
      case 'RestElement':
        collect(node.argument);
        break;
      case 'AssignmentPattern':
        collect(node.left);
        break;
      case 'MemberExpression':
        // assignment target, not a new variable binding
        break;
    }
  }
  collect(node);
  return ids;
}

// collect identifiers that are declared via rest/spread patterns
export function collectRestIdentifiers(node: acorn.Pattern): string[] {
  const ids: string[] = [];
  function collect(node: acorn.Pattern): void {
    switch (node.type) {
      case 'RestElement':
        ids.push(...collectIdentifiers(node.argument as acorn.Pattern));
        break;
      case 'ObjectPattern':
        for (const prop of node.properties) {
          if (prop.type === 'RestElement') {
            ids.push(...collectIdentifiers(prop.argument));
          } else {
            collect(prop.value as acorn.Pattern);
          }
        }
        break;
      case 'ArrayPattern':
        for (const elem of node.elements) {
          if (elem != null) collect(elem);
        }
        break;
      case 'AssignmentPattern':
        collect(node.left);
        break;
    }
  }
  collect(node);
  return ids;
}

export function getLocStr(node: acorn.Node): string {
  if (!node.loc) return '';
  const loc = getLocFromNode(node);
  return ` @ ${locToStr(loc)}`;
}
