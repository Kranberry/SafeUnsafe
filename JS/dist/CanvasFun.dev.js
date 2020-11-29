'use strict';

$(function () {
  // Get the windows dpi
  var dpi = window.devicePixelRatio;
  var phys = new Physics();
  var newGameButton = $("#NewGame");
  var gameBoardCanvas = document.querySelector("#GameBoard");
  var ctx = gameBoardCanvas.getContext("2d"); // Make the Canvas not blurry as shiet

  function FixDpi() {
    // Change the canvas size according to the windows dpi
    var styleHeight = +getComputedStyle(gameBoardCanvas).getPropertyValue("height").slice(0, -2);
    var styleWidth = +getComputedStyle(gameBoardCanvas).getPropertyValue("width").slice(0, -2);
    gameBoardCanvas.setAttribute("height", styleHeight * dpi);
    gameBoardCanvas.setAttribute("width", styleWidth * dpi);
  }

  FixDpi(); // Declare all the variables

  var player = new Player(3, 5, "pink", gameBoardCanvas.width, gameBoardCanvas.height);
  var Positions = [];
  var startPos;
  var friction;
  var collisionObjects;
  var amountOfWalls;
  var platformColor;
  var disapperaingPlatformColor;
  var disapperaingPlatformColorDis;
  var platformSize;
  var dissapearingPlatforms = [];
  var amountOfUnSafePlatforms;
  var amountOfSafePlatforms;
  var platforms = []; // Set all variables to default values

  function StartNewGame() {
    platformSize = 64;
    Positions = [];
    GenerateGridMap();
    platformColor = "Gray";
    disapperaingPlatformColor = "LightGray";
    disapperaingPlatformColorDis = "DarkRed";
    friction = 0.89;
    collisionObjects = [];
    amountOfWalls = 5;
    dissapearingPlatforms = [];
    amountOfUnSafePlatforms = 80;
    amountOfSafePlatforms = 2; // Excluding the player platform

    platforms = [];
    GenerateWalls();
    GenerateSafePlatforms();
    GenerateUnsafePlatforms();
    player.ResetVariables(platforms[0], platformSize, dissapearingPlatforms.length); // Start the game

    Update();
  }

  newGameButton.on({
    click: function click() {
      StartNewGame();
    }
  }); // Generate the grid in 64x64 sizes
  // Will get every possible X and Z position within the canvas

  function GenerateGridMap() {
    var CX = gameBoardCanvas.width;
    var CY = gameBoardCanvas.height;

    for (var x = 0; x < gameBoardCanvas.width; x++) {
      if (x % 64 === 0) {
        for (var y = 0; y < gameBoardCanvas.height; y++) {
          if (y % 64 === 0) {
            var pos = {
              X: x,
              Y: y
            };
            Positions.push(pos);
          }
        }
      }
    }
  } // Generate walls


  function GenerateWalls() {
    // The wall should strectch atleast 1 tile across one side
    var shortSide = 8;
    var possibleSizes = [64, 128, 192];
    var longSide = possibleSizes[Math.floor(Math.random() * possibleSizes.length)];

    for (var i = 0; i < amountOfWalls; i++) {
      // Make the wall only one side long. And not be all to wide
      var vertical = Math.floor(Math.random() * 10 < 5) ? true : false;
      var wallHeight = vertical ? longSide : shortSide;
      var WallWidth = vertical ? shortSide : longSide;
      var pos = Positions[Math.floor(Math.random() * Positions.length)]; // Random position can make two walls be the exact same position. But right now it does not matter.

      var wall = {
        X: pos.X,
        Y: pos.Y,
        Width: WallWidth,
        Height: wallHeight,
        Color: "orange",
        Flag: Flags.Wall
      };
      collisionObjects.push(wall);
    }
  } // Generate all the safe platforms


  function GenerateSafePlatforms() {
    var pos = Positions[Math.floor(Math.random() * Positions.length)];
    var safePlatform = {
      X: pos.X,
      Y: pos.Y,
      Width: platformSize,
      Height: platformSize,
      Color: platformColor,
      Flag: Flags.Ground
    };
    var index = Positions.indexOf(pos);
    Positions.splice(index, 1);
    platforms.push(safePlatform); // { X: player.X - player.Width/2, Y: player.Y - player.Height/2, Width: platformSize, Height: platformSize, Color: platformColor, Flag: Flags.Ground},

    for (var i = 0; i < amountOfSafePlatforms; i++) {
      pos = Positions[Math.floor(Math.random() * Positions.length)];
      safePlatform = {
        X: pos.X,
        Y: pos.Y,
        Width: platformSize,
        Height: platformSize,
        Color: platformColor,
        Flag: Flags.Ground
      };

      var _index = Positions.indexOf(pos);

      Positions.splice(_index, 1);
      platforms.push(safePlatform);
    }
  }

  function GenerateUnsafePlatforms() {
    var unSafePlatform; // { X: 300, Y: 300, Width: platformSize, Height: platformSize, Color: disapperaingPlatformColor, Status: 1, Flag: Flags.DisappearingGround},

    for (var i = 0; i < amountOfUnSafePlatforms; i++) {
      var pos = Positions[Math.floor(Math.random() * Positions.length)];
      unSafePlatform = {
        X: pos.X,
        Y: pos.Y,
        Width: platformSize,
        Height: platformSize,
        Color: disapperaingPlatformColor,
        Status: 1,
        Flag: Flags.DisappearingGround
      };
      var index = Positions.indexOf(pos);
      Positions.splice(index, 1);
      dissapearingPlatforms.push(unSafePlatform);
    }
  } // Draw the safe platforms


  function DrawSafePlatforms() {
    for (var i = 0; i < platforms.length; i++) {
      ctx.beginPath();
      ctx.fillStyle = platforms[i].Color;
      ctx.fillRect(platforms[i].X, platforms[i].Y, platforms[i].Width, platforms[i].Height);
      ctx.closePath();
    }
  } // Draw the disappearing platforms


  function DrawUnSafePlatforms() {
    for (var i = 0; i < dissapearingPlatforms.length; i++) {
      if (dissapearingPlatforms[i].Status === 1 || dissapearingPlatforms[i].Status === 2) {
        ctx.beginPath();
        ctx.fillStyle = dissapearingPlatforms[i].Color;
        ctx.fillRect(dissapearingPlatforms[i].X, dissapearingPlatforms[i].Y, dissapearingPlatforms[i].Width, dissapearingPlatforms[i].Height);
        ctx.closePath();
      }
    }
  } // Draws the score


  function DrawScore(scoreColor) {
    ctx.beginPath();
    ctx.fillStyle = scoreColor;
    ctx.font = "30px Arial";
    ctx.fillText("[" + player.Score + "]", 10, 30);
    ctx.closePath();
  } // Draw the player


  function DrawPlayer() {
    ctx.beginPath();
    ctx.fillStyle = player.Color;
    ctx.fillRect(player.X, player.Y, player.Width, player.Height);
    ctx.closePath();
  } // Draw Walls


  function DrawCollisionObjects() {
    for (var i = 0; i < collisionObjects.length; i++) {
      ctx.beginPath();
      ctx.fillStyle = collisionObjects[i].Color;
      ctx.fillRect(collisionObjects[i].X, collisionObjects[i].Y, collisionObjects[i].Width, collisionObjects[i].Height);
      ctx.closePath();
    }
  } // Draw will clear the board aswell as redraw it with updated locations


  function Draw() {
    ctx.clearRect(0, 0, gameBoardCanvas.width, gameBoardCanvas.height);
    DrawSafePlatforms();
    DrawUnSafePlatforms();
    DrawCollisionObjects();
    DrawPlayer();
    if (player.Score < 20) DrawScore(player.badScoreColor);else if (player.Score <= 50) DrawScore(player.mediocreScoreColor);else if (player.Score >= 51) DrawScore(player.goodScoreColor); // DrawPositions();
    // DrawPositions2();
  }

  function Update() {
    if (player.stopGame === false) {
      // Keep the game running
      requestAnimationFrame(Update); // Keep the game running

      player.MoveHandler(platforms, dissapearingPlatforms, collisionObjects);
      Draw();
    }
  }

  $(document).on({
    keydown: function keydown() {
      player.Keys[event.which] = true;
    },
    keyup: function keyup() {
      player.Keys[event.which] = false;
    }
  });
});