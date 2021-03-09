"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModifyIdDataType1615171068066 = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

/*
 * @Description: 修改users，blogs，comments表id字段类型
 * @Author: MADAO
 * @Date: 2021-03-08 10:37:48
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-08 11:05:08
 */
var ModifyIdDataType1615171068066 = /*#__PURE__*/function () {
  function ModifyIdDataType1615171068066() {
    (0, _classCallCheck2["default"])(this, ModifyIdDataType1615171068066);
  }

  (0, _createClass2["default"])(ModifyIdDataType1615171068066, [{
    key: "up",
    value: function () {
      var _up = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(queryRunner) {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return queryRunner.query('ALTER TABLE users ALTER COLUMN id TYPE integer;');

              case 2:
                _context.next = 4;
                return queryRunner.query('ALTER TABLE blogs ALTER COLUMN id TYPE integer;');

              case 4:
                _context.next = 6;
                return queryRunner.query('ALTER TABLE comments ALTER COLUMN id TYPE integer;');

              case 6:
                _context.next = 8;
                return queryRunner.query('ALTER TABLE blogs ALTER COLUMN "authorId" TYPE integer;');

              case 8:
                _context.next = 10;
                return queryRunner.query('ALTER TABLE comments ALTER COLUMN "blogId" TYPE integer;');

              case 10:
                _context.next = 12;
                return queryRunner.query('ALTER TABLE comments ALTER COLUMN "userId" TYPE integer;');

              case 12:
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
                return queryRunner.query('ALTER TABLE users ALTER COLUMN id TYPE bigint;');

              case 2:
                _context2.next = 4;
                return queryRunner.query('ALTER TABLE blogs ALTER COLUMN id TYPE bigint;');

              case 4:
                _context2.next = 6;
                return queryRunner.query('ALTER TABLE comments ALTER COLUMN id TYPE bigint;');

              case 6:
                _context2.next = 8;
                return queryRunner.query('ALTER TABLE blogs ALTER COLUMN "authorId" TYPE bigint;');

              case 8:
                _context2.next = 10;
                return queryRunner.query('ALTER TABLE comments ALTER COLUMN "blogId" TYPE bigint;');

              case 10:
                _context2.next = 12;
                return queryRunner.query('ALTER TABLE comments ALTER COLUMN "userId" TYPE bigint;');

              case 12:
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
  return ModifyIdDataType1615171068066;
}();

exports.ModifyIdDataType1615171068066 = ModifyIdDataType1615171068066;