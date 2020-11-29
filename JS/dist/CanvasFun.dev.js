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

  var PlayerObj = {
    Score: 0,
    Width: 0,
    Height: 0,
    MaxSpeed: 0,
    Speed: 0,
    X: 0,
    // Initial start value. Always start at the center of the canvas
    Y: 0,
    Color: 0,
    VelocityX: 0,
    VelocityY: 0,
    Flag: ""
  };
  var Positions = [];
  var startPos;
  var friction;
  var Keys = [];
  var collisionObjects;
  var amountOfWalls;
  var scoreValue;
  var winningScore;
  var badScoreColor;
  var goodScoreColor;
  var mediocreScoreColor;
  var lastKnownPositionX;
  var lastKnownPositionY;
  var platformColor;
  var disapperaingPlatformColor;
  var disapperaingPlatformColorDis;
  var platformSize;
  var dissapearingPlatforms = [];
  var amountOfUnSafePlatforms;
  var amountOfSafePlatforms;
  var platforms = []; // If user is a sore loser!!!!!

  var stopGame; // Set all variables to default values

  function StartNewGame() {
    platformSize = 64;
    Positions = [];
    GenerateGridMap();
    platformColor = "Gray";
    disapperaingPlatformColor = "LightGray";
    disapperaingPlatformColorDis = "DarkRed";
    PlayerObj.Score = 0;
    PlayerObj.Width = 32;
    PlayerObj.Height = 32;
    PlayerObj.MaxSpeed = 3;
    PlayerObj.Speed = 3;
    PlayerObj.Color = "purple";
    PlayerObj.VelocityX = 0;
    PlayerObj.VelocityY = 0;
    PlayerObj.Flag = Flags.Player;
    friction = 0.89;
    Keys = [];
    collisionObjects = [];
    amountOfWalls = 5;
    scoreValue = 1;
    badScoreColor = "red";
    goodScoreColor = "green";
    mediocreScoreColor = "orange";
    dissapearingPlatforms = [];
    amountOfUnSafePlatforms = 80;
    winningScore = amountOfUnSafePlatforms;
    amountOfSafePlatforms = 2; // Excluding the player platform

    platforms = [];
    GenerateWalls();
    GenerateSafePlatforms();
    GenerateUnsafePlatforms();
    PlayerObj.X = platforms[0].X + platformSize / 4;
    PlayerObj.Y = platforms[0].Y + platformSize / 4;
    stopGame = false; // Start the game

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
    platforms.push(safePlatform); // { X: PlayerObj.X - PlayerObj.Width/2, Y: PlayerObj.Y - PlayerObj.Height/2, Width: platformSize, Height: platformSize, Color: platformColor, Flag: Flags.Ground},

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
    ctx.fillText("[" + PlayerObj.Score + "]", 10, 30);
    ctx.closePath();
  } // Draw the player


  function DrawPlayer() {
    ctx.beginPath();
    ctx.fillStyle = PlayerObj.Color;
    ctx.fillRect(PlayerObj.X, PlayerObj.Y, PlayerObj.Width, PlayerObj.Height);
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
    if (PlayerObj.Score < 20) DrawScore(badScoreColor);else if (PlayerObj.Score <= 50) DrawScore(mediocreScoreColor);else if (PlayerObj.Score >= 51) DrawScore(goodScoreColor); // DrawPositions();
    // DrawPositions2();
  }

  function UpdateScore() {
    PlayerObj.Score += scoreValue;

    if (PlayerObj.Score === winningScore) {
      console.log(PlayerObj.Score);
      console.log(winningScore);
      PlayerWins();
    }
  }

  function PlayerWins() {
    GameOver("You win! Good Job!");
  } // Game over scub


  function GameOver() {
    var winOrLose = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "GameOver!";
    var answer = prompt(winOrLose + " Final score: " + PlayerObj.Score);

    if (answer == null) {
      alert(":(");
      stopGame = true;
      return;
    } else {
      alert(":D");
      stopGame = true;
      return;
    }
  } // This will handle the players movement


  function MoveHandler() {
    var z = 4;

    if (Keys[87]) // Up
      {
        if (PlayerObj.VelocityY > -PlayerObj.MaxSpeed) {
          PlayerObj.VelocityY -= PlayerObj.Speed; // Will save the last know position

          lastKnownPositionY = PlayerObj.Y + z;
          lastKnownPositionX = PlayerObj.X;
        } else PlayerObj.VelocityY = -PlayerObj.MaxSpeed;
      } else if (Keys[83]) // Down
      {
        if (PlayerObj.VelocityY < PlayerObj.MaxSpeed) {
          PlayerObj.VelocityY += PlayerObj.Speed;
          lastKnownPositionY = PlayerObj.Y - z;
          lastKnownPositionX = PlayerObj.X;
        } else PlayerObj.VelocityY = PlayerObj.MaxSpeed;
      }

    if (Keys[65]) // Left
      {
        if (PlayerObj.VelocityX > -PlayerObj.MaxSpeed) {
          PlayerObj.VelocityX -= PlayerObj.Speed;
          lastKnownPositionX = PlayerObj.X + z;
          lastKnownPositionY = PlayerObj.Y;
        } else PlayerObj.VelocityX = -PlayerObj.MaxSpeed;
      } else if (Keys[68]) // Right
      {
        if (PlayerObj.VelocityX < PlayerObj.MaxSpeed) {
          PlayerObj.VelocityX += PlayerObj.Speed;
          lastKnownPositionX = PlayerObj.X - z;
          lastKnownPositionY = PlayerObj.Y;
        } else PlayerObj.VelocityX = PlayerObj.MaxSpeed;
      } // Create the testing results on collision


    var touchingWhiteSpace = phys.HasCollided(PlayerObj, platforms);
    var hasCollidiedWithGround = phys.HasCollided(PlayerObj, dissapearingPlatforms);
    var hasCollidedWithWalls = phys.HasCollided(PlayerObj, collisionObjects);
    phys.CollisionWithCanvasWalls(PlayerObj, gameBoardCanvas.width, gameBoardCanvas.height); // Gameover if you touch the whitespace

    if (touchingWhiteSpace[1] === undefined && hasCollidiedWithGround[1] === undefined || !touchingWhiteSpace[0] && hasCollidiedWithGround[1].Status === 0) {
      GameOver();
    } // Check collission with the unsafe platforms


    if (hasCollidiedWithGround[0] === true && hasCollidiedWithGround[1].Flag == Flags.DisappearingGround && hasCollidiedWithGround[1].Status === 1) {
      var other = hasCollidiedWithGround[1];
      UpdateScore(1);
      other.Status = 2;
      other.Color = disapperaingPlatformColorDis;
      setTimeout(function () {
        other.Status = 0;
      }, 3000);
    } // Checks the collission with walls


    if (hasCollidedWithWalls[0] === true) {
      PlayerObj.Color = "red";
      PlayerObj.X = lastKnownPositionX;
      PlayerObj.Y = lastKnownPositionY;
      PlayerObj.VelocityX = 0;
      PlayerObj.VelocityY = 0;
    } else PlayerObj.Color = "purple"; // PlayerObj.VelocityY *= friction;


    PlayerObj.Y += PlayerObj.VelocityY; // PlayerObj.VelocityX *= friction;

    PlayerObj.X += PlayerObj.VelocityX;
    PlayerObj.VelocityX = 0;
    PlayerObj.VelocityY = 0;
  }

  function Update() {
    if (stopGame === false) {
      // Keep the game running
      requestAnimationFrame(Update); // Keep the game running

      MoveHandler();
      Draw();
    }
  }

  $(document).on({
    keydown: function keydown() {
      Keys[event.which] = true;
    },
    keyup: function keyup() {
      Keys[event.which] = false;
    }
  });
});