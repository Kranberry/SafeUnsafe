class Player
{
    constructor(speed, maxSpeed, color)
    {
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
    }

    ResetVariables(startPlatform, platformSize)
    {
        this.Score = 0;
        this.Width = 32;
        this.Height = 32;
        this.MaxSpeed = 3;
        this.Speed = 3;
        this.Color = "purple";
        this.VelocityX = 0;
        this.VelocityY = 0;
        this.Flag = Flags.Player;
        this.X = startPlatform.X + platformSize/4;
        this.Y = startPlatform.Y + platformSize/4;
    }
}