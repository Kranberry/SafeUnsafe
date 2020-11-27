'use strict';

$(function()
{
    // Get the windows dpi
    let dpi = window.devicePixelRatio;

    let newGameButton = $("#NewGame");
    let gameBoardCanvas = document.querySelector("#GameBoard");
    let ctx = gameBoardCanvas.getContext("2d");

    // Make the Canvas not blurry as shiet
    function FixDpi()
    {   
        // Change the canvas size according to the windows dpi
        let styleHeight = +getComputedStyle(gameBoardCanvas).getPropertyValue("height").slice(0, -2);
        let styleWidth = +getComputedStyle(gameBoardCanvas).getPropertyValue("width").slice(0, -2);
        gameBoardCanvas.setAttribute("height", styleHeight * dpi);
        gameBoardCanvas.setAttribute("width", styleWidth * dpi);
    }
    FixDpi();
    // Declare all the variables
    let PlayerObj = 
    {
        Score: 0,
        Width: 0,
        Height: 0,
        MaxSpeed: 0,
        Speed: 0,
        X: 0,    // Initial start value. Always start at the center of the canvas
        Y: 0,
        Color: 0,
        VelocityX: 0, 
        VelocityY: 0,
        Flag: ""
    };
    let Positions = [];
    let startPos;
    let friction;
    let Keys = [];
    let collisionObjects;

    let lastKnownPositionX;
    let lastKnownPositionY;

    let platformColor;
    let disapperaingPlatformColor;
    let disapperaingPlatformColorDis;
    let platformSize;
    let dissapearingPlatforms = [];
    let amountOfUnSafePlatforms;
    let amountOfSafePlatforms;
    let platforms = [];
    // If user is a sore loser!!!!!
    let stopGame;
    // Set all variables to default values
    function StartNewGame()
    {
        platformSize = 64;
        Positions = [];
        GenerateGridMap()
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
        collisionObjects = [
            // { X: 300, Y: 300, Width: 20, Height: 150, Color: "blue", Flag: Flags.Wall},
            // { X: 400, Y: 400, Width: 150, Height: 20, Color: "orange", Flag: Flags.Wall },
            // { X: 450, Y: 300, Width: 20, Height: 150, Color: "yellow", Flag: Flags.Wall },
        ];
        dissapearingPlatforms = [ ];
        amountOfUnSafePlatforms = 80;
        amountOfSafePlatforms = 2; // Excluding the player platform
        platforms = [ ];
        GenerateSafePlatforms();
        GenerateUnsafePlatforms();
        PlayerObj.X = platforms[0].X + platformSize/4;
        PlayerObj.Y = platforms[0].Y + platformSize/4;

        stopGame = false;

        // Start the game
        Update();
    }
    newGameButton.on({click: () => { StartNewGame(); }});
    // Generate the grid in 64x64 sizes
    // Will get every possible X and Z position within the canvas
    function GenerateGridMap()
    {
        let CX = gameBoardCanvas.width;
        let CY = gameBoardCanvas.height;

        for(let x = 0; x < gameBoardCanvas.width; x++)
        {
            if( x % 64 === 0 )
            {
                for(let y = 0; y < gameBoardCanvas.height; y++ )
                {
                    if( y % 64 === 0 )
                    {
                        let pos = { X: x, Y: y };
                        Positions.push(pos);
                    }
                }
            }
        }
    }

    function GenerateSafePlatforms()
    {
        let pos = Positions[Math.floor(Math.random() * Positions.length)];

        let safePlatform = { X: pos.X, Y: pos.Y, Width: platformSize, Height: platformSize, Color: platformColor, Flag: Flags.Ground }; 
        
        
        let index = Positions.indexOf(pos);
        Positions.splice(index, 1);

        platforms.push(safePlatform);

        // { X: PlayerObj.X - PlayerObj.Width/2, Y: PlayerObj.Y - PlayerObj.Height/2, Width: platformSize, Height: platformSize, Color: platformColor, Flag: Flags.Ground},
        for(let i = 0; i < amountOfSafePlatforms; i++)
        {
            pos = Positions[Math.floor(Math.random() * Positions.length)];
            safePlatform = { 
                X: pos.X, 
                Y: pos.Y, 
                Width: platformSize, 
                Height: platformSize, 
                Color: platformColor, 
                Flag: Flags.Ground 
            };
            
            let index = Positions.indexOf(pos);
            Positions.splice(index, 1);

            platforms.push(safePlatform);
        }
    }
    function GenerateUnsafePlatforms()
    {
        let unSafePlatform;
        // { X: 300, Y: 300, Width: platformSize, Height: platformSize, Color: disapperaingPlatformColor, Status: 1, Flag: Flags.DisappearingGround},
        for(let i = 0; i < amountOfUnSafePlatforms; i++)
        {
            let pos = Positions[Math.floor(Math.random() * Positions.length)];
            unSafePlatform = { 
                X: pos.X, 
                Y: pos.Y, 
                Width: platformSize, 
                Height: platformSize, 
                Color: disapperaingPlatformColor, 
                Status: 1, 
                Flag: Flags.DisappearingGround
            };
            
            
            let index = Positions.indexOf(pos);
            Positions.splice(index, 1);

            dissapearingPlatforms.push(unSafePlatform);
        }
    }
    // Draw the safe platforms
    function DrawSafePlatforms()
    {
        for(let i = 0; i < platforms.length; i++)
        {
            ctx.beginPath();
            ctx.fillStyle = platforms[i].Color;
            ctx.fillRect(platforms[i].X, platforms[i].Y, platforms[i].Width, platforms[i].Height);
            ctx.closePath();
        }
    }
    // Draw the disappearing platforms
    function DrawUnSafePlatforms()
    {
        for(let i = 0; i < dissapearingPlatforms.length; i++)
        {
            if(dissapearingPlatforms[i].Status === 1 || dissapearingPlatforms[i].Status === 2)
            {
                ctx.beginPath();
                ctx.fillStyle = dissapearingPlatforms[i].Color;
                ctx.fillRect(dissapearingPlatforms[i].X, dissapearingPlatforms[i].Y, dissapearingPlatforms[i].Width, dissapearingPlatforms[i].Height);
                ctx.closePath();
            }
        }
    }

    // Draws the score
    function DrawScore()
    {
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText("[" + PlayerObj.Score + "]", 10, 30);
        ctx.closePath();
    }
    // Draw the player
    function DrawPlayer()
    {
        ctx.beginPath();
        ctx.fillStyle = PlayerObj.Color;
        ctx.fillRect(PlayerObj.X, PlayerObj.Y, PlayerObj.Width, PlayerObj.Height);
        ctx.closePath();
    }
    // Draw Walls
    function DrawCollisionObjects()
    {
        for(let i = 0; i < collisionObjects.length; i++)
        {
            ctx.beginPath();
            ctx.fillStyle = collisionObjects[i].Color;
            ctx.fillRect(collisionObjects[i].X, collisionObjects[i].Y, collisionObjects[i].Width, collisionObjects[i].Height);
            ctx.closePath();
        }
    }

    // function DrawPositions()
    // {
    //     ctx.beginPath();
    //     ctx.fillStyle = "black";
    //     ctx.font = "30px Arial";
    //     ctx.fillText("Current Pos: {" + PlayerObj.X + ", " + PlayerObj.Y + "}" , 10, 60);
    //     ctx.closePath();
    // }
    // function DrawPositions2()
    // {
    //     ctx.beginPath();
    //     ctx.fillStyle = "black";
    //     ctx.font = "30px Arial";
    //     ctx.fillText("Last Known Pos: {" + lastKnownPositionX + ", " + lastKnownPositionY + "}" , 10, 90);
    //     ctx.closePath();
    // }

    // Draw will clear the board aswell as redraw it with updated locations
    function Draw()
    {
        ctx.clearRect(0, 0, gameBoardCanvas.width, gameBoardCanvas.height);
        DrawSafePlatforms();
        DrawUnSafePlatforms();
        DrawCollisionObjects();
        DrawPlayer();
        DrawScore();
        // DrawPositions();
        // DrawPositions2();
    }

    function UpdateScore(scoreValue)
    {
        PlayerObj.Score += scoreValue;
    }
    // Game over scub
    function GameOver()
    {
        let answer = prompt("GameOver! Final score: " + PlayerObj.Score);
        if( answer == null)
        {
            alert(":(");
            stopGame = true;
            return;
        }
        else
        {
            alert(":D");   
            stopGame = true;
            return;
        }
    }

    // This will handle the players movement
    function MoveHandler()
    {
        let z = 2;
        if(Keys[87])    // Up
        {
            if(PlayerObj.VelocityY > -PlayerObj.MaxSpeed)
            {
                PlayerObj.VelocityY -= PlayerObj.Speed;
                // Will save the last know position
                lastKnownPositionY = PlayerObj.Y+z;
            }
            else
                PlayerObj.VelocityY = -PlayerObj.MaxSpeed;
        }
        else if(Keys[83])    // Down
        {
            if(PlayerObj.VelocityY < PlayerObj.MaxSpeed)
            {
                PlayerObj.VelocityY += PlayerObj.Speed;
                lastKnownPositionY = PlayerObj.Y-z;
            }
            else
                PlayerObj.VelocityY = PlayerObj.MaxSpeed;
        }
        if(Keys[65])    // Left
        {
            if(PlayerObj.VelocityX > -PlayerObj.MaxSpeed)
            {
                lastKnownPositionX = PlayerObj.X+z; 
                PlayerObj.VelocityX -= PlayerObj.Speed;
            }
            else
                PlayerObj.VelocityX = -PlayerObj.MaxSpeed;
        }
        else if(Keys[68])    // Right
        {
            if(PlayerObj.VelocityX < PlayerObj.MaxSpeed)
            {
                PlayerObj.VelocityX += PlayerObj.Speed;
                lastKnownPositionX = PlayerObj.X-z;
            }
            else
                PlayerObj.VelocityX = PlayerObj.MaxSpeed;
        }

        // Create the testing results on collision
        let touchingWhiteSpace = HasCollided(PlayerObj, platforms);
        let hasCollidiedWithGround = HasCollided(PlayerObj, dissapearingPlatforms);
        let hasCollidedWithWalls = HasCollided(PlayerObj, collisionObjects);

        // Gameover if you touch the whitespace
        if( (touchingWhiteSpace[1] === undefined && hasCollidiedWithGround[1] === undefined) || (!touchingWhiteSpace[0] && hasCollidiedWithGround[1].Status === 0))
        {
            GameOver();
        }
        // Check collission with the unsafe platforms
        if(hasCollidiedWithGround[0] === true && hasCollidiedWithGround[1].Flag == Flags.DisappearingGround && hasCollidiedWithGround[1].Status === 1)
        {
            let other = hasCollidiedWithGround[1];
            UpdateScore(1);
            other.Status = 2;
            other.Color = disapperaingPlatformColorDis;
            setTimeout( () => {
                other.Status = 0;
            }, 3000);
        }
        // Checks the collission with walls
        if(hasCollidedWithWalls[0] === true)
        {
            PlayerObj.Color = "red";
            PlayerObj.X = lastKnownPositionX;
            PlayerObj.Y = lastKnownPositionY;
            PlayerObj.VelocityX = 0;
            PlayerObj.VelocityY = 0;
        }
        else
            PlayerObj.Color = "purple";

        
        // PlayerObj.VelocityY *= friction;
        PlayerObj.Y += PlayerObj.VelocityY;

        // PlayerObj.VelocityX *= friction;
        PlayerObj.X += PlayerObj.VelocityX;
        PlayerObj.VelocityX = 0;
        PlayerObj.VelocityY = 0;
    }

    // Returns an array, with first index is true, and second is the object collided with
    function HasCollided(thisObj, otherObj)
    {
        if (thisObj.X >= gameBoardCanvas.width-thisObj.Width)
            thisObj.X = gameBoardCanvas.width-thisObj.Width;
        else if (thisObj.X <= 0)
            thisObj.X = 0;

        if (thisObj.Y >= gameBoardCanvas.height-thisObj.Height)
            thisObj.Y = gameBoardCanvas.height-thisObj.Height;
        else if (thisObj.Y < 0)
            thisObj.Y = 0;
            
        for(let i = 0; i < otherObj.length; i++)
        {
            if(thisObj.X + thisObj.Width > otherObj[i].X &&                   // =>
               thisObj.X < otherObj[i].X + otherObj[i].Width &&   // <=
               thisObj.Y + thisObj.Height > otherObj[i].Y &&                  // ^
               thisObj.Y < otherObj[i].Y + otherObj[i].Height ) // v
            {
                // Returnera true och collision objektet
                return [true, otherObj[i]];
            }
        }
        return false;
    }

    function Update()
    {
        if(stopGame === false)
        {
            // Keep the game running
            requestAnimationFrame(Update);
            // Keep the game running
            
            MoveHandler();
            Draw();
        }
    }


    $(document).on({
        keydown: () =>
        {
            Keys[event.which] = true;
        },
        keyup: () =>
        {
            Keys[event.which] = false;
        }
    })

});