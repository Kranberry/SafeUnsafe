"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Physics =
/*#__PURE__*/
function () {
  function Physics() {
    _classCallCheck(this, Physics);
  }

  _createClass(Physics, [{
    key: "CollisionWithCanvasWalls",
    // This collission detection is used to detect if the objects position is at the gameboard limits
    value: function CollisionWithCanvasWalls(thisObj, gameBoardCanvasWidth, gameBoardCanvasHeight) {
      if (thisObj.X >= gameBoardCanvasWidth - thisObj.Width) thisObj.X = gameBoardCanvasWidth - thisObj.Width;else if (thisObj.X <= 0) thisObj.X = 0;
      if (thisObj.Y >= gameBoardCanvasHeight - thisObj.Height) thisObj.Y = gameBoardCanvasHeight - thisObj.Height;else if (thisObj.Y < 0) thisObj.Y = 0;
    } // Returns an array, with first index is true, and second is the object collided with

  }, {
    key: "HasCollided",
    value: function HasCollided(thisObj, otherObj) {
      for (var i = 0; i < otherObj.length; i++) {
        if (thisObj.X + thisObj.Width > otherObj[i].X && // =>
        thisObj.X < otherObj[i].X + otherObj[i].Width && // <=
        thisObj.Y + thisObj.Height > otherObj[i].Y && // ^
        thisObj.Y < otherObj[i].Y + otherObj[i].Height) // v
          {
            // Returnera true och collision objektet
            return [true, otherObj[i]];
          }
      }

      return false;
    }
  }]);

  return Physics;
}();