(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(global, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 250:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ setCommonColumns)
/* harmony export */ });
/*
 * @Description: 设置数据表的通用列
 * @Author: MADAO
 * @Date: 2021-04-08 13:42:42
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 13:48:35
 */
function setCommonColumns(columns) {
  return columns.concat([{
    name: 'id',
    type: 'integer',
    isNullable: false,
    isGenerated: true,
    generationStrategy: 'increment'
  }, {
    name: 'createdAt',
    type: 'timestamp',
    isNullable: false,
    default: 'now()'
  }, {
    name: 'updatedAt',
    type: 'timestamp',
    isNullable: false,
    default: 'now()'
  }]);
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "CreateComments1617867658529": () => (/* binding */ CreateComments1617867658529)
});

;// CONCATENATED MODULE: external "typeorm"
const external_typeorm_namespaceObject = require("typeorm");;
// EXTERNAL MODULE: ./model/tools/setCommonColumns.ts
var setCommonColumns = __webpack_require__(250);
;// CONCATENATED MODULE: ./model/migration/1617867658529-CreateComments.ts
/*
 * @Description: 创建comments表
 * @Author: MADAO
 * @Date: 2021-04-08 15:40:58
 * @LastEditors: MADAO
 * @LastEditTime: 2021-04-08 15:45:00
 */


class CreateComments1617867658529 {
  async up(queryRunner) {
    await queryRunner.createTable(new external_typeorm_namespaceObject.Table({
      name: 'comments',
      columns: (0,setCommonColumns.default)([{
        name: 'userId',
        type: 'integer',
        isNullable: false
      }, {
        name: 'content',
        type: 'text',
        isNullable: false
      }, {
        name: 'postId',
        type: 'integer',
        isNullable: false
      }])
    }), true);
  }

  async down(queryRunner) {
    await queryRunner.dropTable('comments', true);
  }

}
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});