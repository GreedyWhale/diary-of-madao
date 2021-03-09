"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateBlogs1615024025911 = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _typeorm = require("typeorm");

/*
 * @Description: 创建 blogs 表
 * @Author: MADAO
 * @Date: 2021-03-06 17:47:05
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-06 17:57:52
 */
var CreateBlogs1615024025911 = /*#__PURE__*/function () {
  function CreateBlogs1615024025911() {
    (0, _classCallCheck2["default"])(this, CreateBlogs1615024025911);
  }

  (0, _createClass2["default"])(CreateBlogs1615024025911, [{
    key: "up",
    value: function () {
      var _up = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(queryRunner) {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return queryRunner.createTable(new _typeorm.Table({
                  name: 'blogs',
                  columns: [{
                    name: 'id',
                    type: 'bigint',
                    isPrimary: true,
                    isNullable: false,
                    generationStrategy: 'increment'
                  }, {
                    name: 'title',
                    type: 'varchar',
                    isNullable: false
                  }, {
                    name: 'content',
                    type: 'text',
                    isNullable: false
                  }, {
                    name: 'authorId',
                    type: 'bigint',
                    isNullable: false
                  }, {
                    name: 'createdAt',
                    type: 'timestamp',
                    isNullable: false,
                    "default": 'now()'
                  }, {
                    name: 'updatedAt',
                    type: 'timestamp',
                    isNullable: false,
                    "default": 'now()'
                  }]
                }));

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function up(_x) {
        return _up.apply(this, arguments);
      }

      return up;
    }()
  }, {
    key: "down",
    value: function () {
      var _down = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(queryRunner) {
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return queryRunner.dropTable('blogs');

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function down(_x2) {
        return _down.apply(this, arguments);
      }

      return down;
    }()
  }]);
  return CreateBlogs1615024025911;
}();

exports.CreateBlogs1615024025911 = CreateBlogs1615024025911;