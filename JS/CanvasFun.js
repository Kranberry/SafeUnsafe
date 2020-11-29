'use strict';

$(function()
{
    // Get the windows dpi
    let dpi = window.devicePixelRatio;
    let phys = new Physics();

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
    let player = new Player(3, 5, "pink");
    let Positions = [];
    let startPos;
    let friction;
    let Keys = [];
    let collisionObjects;
    let amountOfWalls;
    let scoreValue;
    let winningScore;
    let badScoreColor;
    let goodScoreColor;
    let mediocreScoreColor;

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
        friction = 0.89;
        Keys = [];
        collisionObjects = [ ];
        amountOfWalls = 5;
        scoreValue = 1;
        badScoreColor = "red";
        goodScoreColor = "green";
        mediocreScoreColor = "orange";
        dissapearingPlatforms = [ ];
        amountOfUnSafePlatforms = 80;
        winningScore = amountOfUnSafePlatforms;
        amountOfSafePlatforms = 2; // Excluding the player platform
        platforms = [ ];
        GenerateWalls();
        GenerateSafePlatforms();
        GenerateUnsafePlatforms();
        player.ResetVariables(platforms[0], platformSize);

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
    // Generate walls
    function GenerateWalls()
    {
        // The wall should strectch atleast 1 tile across one side
        let shortSide = 8;
        let possibleSizes = [ 64 ,128, 192 ];
        let longSide = possibleSizes[Math.floor(Math.random() * possibleSizes.length)];
        
        for(let i = 0; i < amountOfWalls; i++)
        {
            // Make the wall only one side long. And not be all to wide
            let vertical = (Math.floor(Math.random() * 10 < 5)) ? true : false;
            let wallHeight = vertical ? longSide : shortSide;
            let WallWidth = vertical ? shortSide : longSide;
            let pos = Positions[Math.floor(Math.random() * Positions.length)];
            // Random position can make two walls be the exact same position. But right now it does not matter.
            let wall = { X: pos.X, Y: pos.Y, Width: WallWidth, Height: wallHeight, Color: "orange", Flag: Flags.Wall};
            collisionObjects.push(wall);
        }
    }
    // Generate all the safe platforms
    function GenerateSafePlatforms()
    {
        let pos = Positions[Math.floor(Math.random() * Positions.length)];

        let safePlatform = { X: pos.X, Y: pos.Y, Width: platformSize, Height: platformSize, Color: platformColor, Flag: Flags.Ground }; 
        
        
        let index = Positions.indexOf(pos);
        Positions.splice(index, 1);

        platforms.push(safePlatform);

        // { X: player.X - player.Width/2, Y: player.Y - player.Height/2, Width: platformSize, Height: platformSize, Color: platformColor, Flag: Flags.Ground},
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
    function DrawScore(scoreColor)
    {
        ctx.beginPath();
        ctx.fillStyle = scoreColor;
        ctx.font = "30px Arial";
        ctx.fillText("[" + player.Score + "]", 10, 30);
        ctx.closePath();
    }
    // Draw the player
    function DrawPlayer()
    {
        ctx.beginPath();
        ctx.fillStyle = player.Color;
        ctx.fillRect(player.X, player.Y, player.Width, player.Height);
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

    // Draw will clear the board aswell as redraw it with updated locations
    function Draw()
    {
        ctx.clearRect(0, 0, gameBoardCanvas.width, gameBoardCanvas.height);
        DrawSafePlatforms();
        DrawUnSafePlatforms();
        DrawCollisionObjects();
        DrawPlayer();
        if(player.Score < 20)
            DrawScore(badScoreColor);
        else if(player.Score <= 50)
            DrawScore(mediocreScoreColor);
        else if(player.Score >= 51)
            DrawScore(goodScoreColor);
        // DrawPositions();
        // DrawPositions2();
    }

    function UpdateScore()
    {
        player.Score += scoreValue;
        if(player.Score === winningScore)
        {
            console.log(player.Score);
            console.log(winningScore);
            PlayerWins();
        }
    }

    function PlayerWins()
    {
        GameOver("You win! Good Job!");
    }
    
    // Game over scub
    function GameOver(winOrLose = "GameOver!")
    {
        let answer = prompt(winOrLose + " Final score: " + player.Score);
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
        let z = 4;
        if(Keys[87])    // Up
        {
            if(player.VelocityY > -player.MaxSpeed)
            {
                player.VelocityY -= player.Speed;
                // Will save the last know position
                lastKnownPositionY = player.Y+z;
                lastKnownPositionX = player.X;
            }
            else
                player.VelocityY = -player.MaxSpeed;
        }
        else if(Keys[83])    // Down
        {
            if(player.VelocityY < player.MaxSpeed)
            {
                player.VelocityY += player.Speed;
                lastKnownPositionY = player.Y-z;
                lastKnownPositionX = player.X;
            }
            else
                player.VelocityY = player.MaxSpeed;
        }
        if(Keys[65])    // Left
        {
            if(player.VelocityX > -player.MaxSpeed)
            {
                player.VelocityX -= player.Speed;
                lastKnownPositionX = player.X+z; 
                lastKnownPositionY = player.Y;
            }
            else
                player.VelocityX = -player.MaxSpeed;
        }
        else if(Keys[68])    // Right
        {
            if(player.VelocityX < player.MaxSpeed)
            {
                player.VelocityX += player.Speed;
                lastKnownPositionX = player.X-z;
                lastKnownPositionY = player.Y;
            }
            else
                player.VelocityX = player.MaxSpeed;
        }

        // Create the testing results on collision
        let touchingWhiteSpace = phys.HasCollided(player, platforms);
        let hasCollidiedWithGround = phys.HasCollided(player, dissapearingPlatforms);
        let hasCollidedWithWalls = phys.HasCollided(player, collisionObjects);

        phys.CollisionWithCanvasWalls(player, gameBoardCanvas.width, gameBoardCanvas.height);

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
            player.Color = "red";
            player.X = lastKnownPositionX;
            player.Y = lastKnownPositionY;
            player.VelocityX = 0;
            player.VelocityY = 0;
        }
        else
            player.Color = "purple";

        
        // player.VelocityY *= friction;
        player.Y += player.VelocityY;

        // player.VelocityX *= friction;
        player.X += player.VelocityX;
        player.VelocityX = 0;
        player.VelocityY = 0;
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