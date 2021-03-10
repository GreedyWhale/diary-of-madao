"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.changeIdColumns1615190985733 = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _typeorm = require("typeorm");

/*
 * @Description: 补充id字段的isGenerated属性
 * @Author: MADAO
 * @Date: 2021-03-08 16:09:45
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-08 16:13:07
 */
var changeIdColumns1615190985733 = /*#__PURE__*/function () {
  function changeIdColumns1615190985733() {
    (0, _classCallCheck2["default"])(this, changeIdColumns1615190985733);
  }

  (0, _createClass2["default"])(changeIdColumns1615190985733, [{
    key: "up",
    value: function () {
      var _up = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(queryRunner) {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return queryRunner.changeColumn('users', 'id', new _typeorm.TableColumn({
                  name: 'id',
                  isPrimary: true,
                  type: 'bigint',
                  generationStrategy: 'increment',
                  isNullable: false,
                  isGenerated: true
                }));

              case 2:
                _context.next = 4;
                return queryRunner.changeColumn('blogs', 'id', new _typeorm.TableColumn({
                  name: 'id',
                  isPrimary: true,
                  type: 'bigint',
                  generationStrategy: 'increment',
                  isNullable: false,
                  isGenerated: true
                }));

              case 4:
                _context.next = 6;
                return queryRunner.changeColumn('comments', 'id', new _typeorm.TableColumn({
                  name: 'id',
                  isPrimary: true,
                  type: 'bigint',
                  generationStrategy: 'increment',
                  isNullable: false,
                  isGenerated: true
                }));

              case 6:
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
                return queryRunner.changeColumn('users', 'id', new _typeorm.TableColumn({
                  name: 'id',
                  isPrimary: true,
                  type: 'bigint',
                  generationStrategy: 'increment',
                  isNullable: false
                }));

              case 2:
                _context2.next = 4;
                return queryRunner.changeColumn('blogs', 'id', new _typeorm.TableColumn({
                  name: 'id',
                  isPrimary: true,
                  type: 'bigint',
                  generationStrategy: 'increment',
                  isNullable: false
                }));

              case 4:
                _context2.next = 6;
                return queryRunner.changeColumn('comments', 'id', new _typeorm.TableColumn({
                  name: 'id',
                  isPrimary: true,
                  type: 'bigint',
                  generationStrategy: 'increment',
                  isNullable: false
                }));

              case 6:
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
  return changeIdColumns1615190985733;
}();

exports.changeIdColumns1615190985733 = changeIdColumns1615190985733;