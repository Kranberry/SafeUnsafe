"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Player =
/*#__PURE__*/
function () {
  function Player(speed, maxSpeed, color) {
    _classCallCheck(this, Player);

    this.Score = 0;
    this.Width = 0;
    this.Height = 0;
    this.MaxSpeed = maxSpeed;
    this.Speed = speed;
    this.X = 0; // Initial start value. Always start at the center of the canvas

    this.Y = 0;
    this.Color = color;
    this.VelocityX = 0;
    this.VelocityY = 0;
    this.Flag = "";
  }

  _createClass(Player, [{
    key: "ResetVariables",
    value: function ResetVariables(startPlatform, platformSize) {
      this.Score = 0;
      this.Width = 32;
      this.Height = 32;
      this.MaxSpeed = 3;
      this.Speed = 3;
      this.Color = "purple";
      this.VelocityX = 0;
      this.VelocityY = 0;
      this.Flag = Flags.Player;
      this.X = startPlatform.X + platformSize / 4;
      this.Y = startPlatform.Y + platformSize / 4;
    }
  }]);

  return Player;
}();