using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ActiveSystems.Models
{
    public class CrossBar
    {        
        public string Color { set; get; }
        public List<Point> Points { set; get; } = new List<Models.Point>();
    }
}
