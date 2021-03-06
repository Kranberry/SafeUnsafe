class Player
{
    constructor(speed, maxSpeed, color, gameBoardCanvasWidth, gameBoardCanvasHeight)
    {
        this.gameBoardCanvasWidth = gameBoardCanvasWidth;
        this.gameBoardCanvasHeight = gameBoardCanvasHeight;
        this.Keys = [ ];
        this.Score = 0;
        this.Width = 0;
        this.Height = 0;
        this.MaxSpeed = maxSpeed;
        this.Speed = speed;
        this.X = 0;    // Initial start value. Always start at the center of the canvas
        this.Y = 0;
        this.Color = color;
        this.VelocityX = 0; 
        this.VelocityY = 0;
        this.Flag = "";
        this.stopGame = true;
        this.platformColor = "Gray";
        this.disapperaingPlatformColor = "LightGray";
        this.disapperaingPlatformColorDis = "DarkRed";

        this.lastKnownPositionX;
        this.lastKnownPositionY;
        this.scoreValue;
        this.winningScore;
        this.badScoreColor;
        this.goodScoreColor;
        this.mediocreScoreColor;
    }

    ResetVariables(startPlatform, platformSize, amountToWin)
    {
        this.Keys = [ ];
        this.Score = 0;
        this.Width = 32;
        this.Height = 32;
        this.MaxSpeed = 3;
        this.Speed = 3;
        this.Color = "purple";
        this.VelocityX = 0;
        this.VelocityY = 0;
        this.Flag = Flags.Player;
        this.stopGame = false;

        this.X = startPlatform.X + platformSize/4;
        this.Y = startPlatform.Y + platformSize/4;
        this.scoreValue = 1;
        this.winningScore = amountToWin;
        this.badScoreColor = "red";
        this.goodScoreColor = "green";
        this.mediocreScoreColor = "orange";
    }

    // This will handle the players movement
    MoveHandler(platforms, dissapearingPlatforms, collisionObjects)
    {
        let phys = new Physics();

        let z = 6;
        if(this.Keys[87])    // Up
        {
            if(this.VelocityY > -this.MaxSpeed)
            {
                this.VelocityY -= this.Speed;
                // Will save the last know position
                this.lastKnownPositionY = this.Y+z;
                this.lastKnownPositionX = this.X;
            }
            else
                this.VelocityY = -this.MaxSpeed;
        }
        else if(this.Keys[83])    // Down
        {
            if(this.VelocityY < this.MaxSpeed)
            {
                this.VelocityY += this.Speed;
                this.lastKnownPositionY = this.Y-z;
                this.lastKnownPositionX = this.X;
            }
            else
                this.VelocityY = this.MaxSpeed;
        }
        if(this.Keys[65])    // Left
        {
            if(this.VelocityX > -this.MaxSpeed)
            {
                this.VelocityX -= this.Speed;
                this.lastKnownPositionX = this.X+z; 
                this.lastKnownPositionY = this.Y;
            }
            else
                this.VelocityX = -this.MaxSpeed;
        }
        else if(this.Keys[68])    // Right
        {
            if(this.VelocityX < this.MaxSpeed)
            {
                this.VelocityX += this.Speed;
                this.lastKnownPositionX = this.X-z;
                this.lastKnownPositionY = this.Y;
            }
            else
                this.VelocityX = this.MaxSpeed;
        }

        // Create the testing results on collision
        let touchingWhiteSpace = phys.HasCollided(this, platforms);
        let hasCollidiedWithGround = phys.HasCollided(this, dissapearingPlatforms);
        let hasCollidedWithWalls = phys.HasCollided(this, collisionObjects);

        phys.CollisionWithCanvasWalls(this, this.gameBoardCanvasWidth, this.gameBoardCanvasHeight);

        // Gameover if you touch the whitespace
        if( (touchingWhiteSpace[1] === undefined && hasCollidiedWithGround[1] === undefined) || (!touchingWhiteSpace[0] && hasCollidiedWithGround[1].Status === 0))
        {
            this.GameOver();
        }
        // Check collission with the unsafe platforms
        if(hasCollidiedWithGround[0] === true && hasCollidiedWithGround[1].Flag == Flags.DisappearingGround && hasCollidiedWithGround[1].Status === 1)
        {
            let other = hasCollidiedWithGround[1];
            this.UpdateScore(1);
            other.Status = 2;
            other.Color = this.disapperaingPlatformColorDis;
            setTimeout( () => {
                other.Status = 0;
            }, 3000);
        }
        // Checks the collission with walls
        if(hasCollidedWithWalls[0] === true)
        {
            this.Color = "red";
            this.X = this.lastKnownPositionX;
            this.Y = this.lastKnownPositionY;
            this.VelocityX = 0;
            this.VelocityY = 0;
        }
        else
            this.Color = "purple";

        
        // this.VelocityY *= friction;
        this.Y += this.VelocityY;

        // this.VelocityX *= friction;
        this.X += this.VelocityX;
        this.VelocityX = 0;
        this.VelocityY = 0;
    }

    // Update the score
    UpdateScore()
    {
        this.Score += this.scoreValue;
        if(this.Score === this.winningScore)
        {
            this.PlayerWins();
        }
    }

    PlayerWins()
    {
        this.GameOver("You win! Good Job!");
    }
    
    // Game over scub
    GameOver(winOrLose = "GameOver!")
    {
        let answer = prompt(winOrLose + " Final score: " + this.Score);
        if( answer == null)
        {
            alert(":(");
            this.stopGame = true;
            return;
        }
        else
        {
            alert(":D");   
            this.stopGame = true;
            return;
        }
    }
}