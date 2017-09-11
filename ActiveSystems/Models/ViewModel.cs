using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ActiveSystems.Models
{
    public class ViewModel
    {
        public string Id { set; get; }
        public Point CanvasSize { set; get; }
        public CrossBar CrossBar { set; get; } = new CrossBar();
    }
}
