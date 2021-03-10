"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

require("reflect-metadata");

var _typeorm = require("typeorm");

var _User = require("./entity/User");

var _Blog = require("./entity/Blog");

var _Comment = require("./entity/Comment");

/*
 * @Description: 填充数据
 * @Author: MADAO
 * @Date: 2021-03-08 15:22:09
 * @LastEditors: MADAO
 * @LastEditTime: 2021-03-10 11:27:55
 */
(0, _typeorm.createConnection)().then( /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(connection) {
    var user, blog, comment;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            user = new _User.User({
              username: 'MADAO',
              passwordDigest: Math.random().toString(16)
            });
            blog = new _Blog.Blog({
              title: '我的第一篇博客',
              content: '写点什么好呢？',
              author: user
            });
            comment = new _Comment.Comment({
              content: '我也不知道写点什么好',
              user: user,
              blog: blog
            });
            _context.next = 5;
            return connection.manager.save(user);

          case 5:
            _context.next = 7;
            return connection.manager.save(blog);

          case 7:
            _context.next = 9;
            return connection.manager.save(comment);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}())["catch"](function (error) {
  return console.log(error);
});