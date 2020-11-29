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
    let player = new Player(3, 5, "pink", gameBoardCanvas.width, gameBoardCanvas.height);
    let Positions = [];
    let startPos;
    let friction;
    let collisionObjects;
    let amountOfWalls;

    let platformColor;
    let disapperaingPlatformColor;
    let disapperaingPlatformColorDis;
    let platformSize;
    let dissapearingPlatforms = [];
    let amountOfUnSafePlatforms;
    let amountOfSafePlatforms;
    let platforms = [];

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
        collisionObjects = [ ];
        amountOfWalls = 5;
        dissapearingPlatforms = [ ];
        amountOfUnSafePlatforms = 80;
        amountOfSafePlatforms = 2; // Excluding the player platform
        platforms = [ ];
        GenerateWalls();
        GenerateSafePlatforms();
        GenerateUnsafePlatforms();
        player.ResetVariables(platforms[0], platformSize, dissapearingPlatforms.length);

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
            DrawScore(player.badScoreColor);
        else if(player.Score <= 50)
            DrawScore(player.mediocreScoreColor);
        else if(player.Score >= 51)
            DrawScore(player.goodScoreColor);
        // DrawPositions();
        // DrawPositions2();
    }

    function Update()
    {
        if(player.stopGame === false)
        {
            // Keep the game running
            requestAnimationFrame(Update);
            // Keep the game running
            
            player.MoveHandler(platforms, dissapearingPlatforms, collisionObjects);
            Draw();
        }
    }

    $(document).on({
        keydown: () =>
        {
            player.Keys[event.which] = true;
        },
        keyup: () =>
        {
            player.Keys[event.which] = false;
        }
    })

});