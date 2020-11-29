class Physics
{

    // This collission detection is used to detect if the objects position is at the gameboard limits
    CollisionWithCanvasWalls(thisObj, gameBoardCanvasWidth, gameBoardCanvasHeight)
    {
        if (thisObj.X >= gameBoardCanvasWidth-thisObj.Width)
            thisObj.X = gameBoardCanvasWidth-thisObj.Width;
        else if (thisObj.X <= 0)
            thisObj.X = 0;

        if (thisObj.Y >= gameBoardCanvasHeight-thisObj.Height)
            thisObj.Y = gameBoardCanvasHeight-thisObj.Height;
        else if (thisObj.Y < 0)
            thisObj.Y = 0;
    }
     // Returns an array, with first index is true, and second is the object collided with
    HasCollided(thisObj, otherObj)
     {
         for(let i = 0; i < otherObj.length; i++)
         {
             if(thisObj.X + thisObj.Width > otherObj[i].X &&                 // =>
                thisObj.X < otherObj[i].X + otherObj[i].Width &&             // <=
                thisObj.Y + thisObj.Height > otherObj[i].Y &&                // ^
                thisObj.Y < otherObj[i].Y + otherObj[i].Height )             // v
             {
                 // Returnera true och collision objektet
                 return [true, otherObj[i]];
             }
         }
         return false;
     }
}