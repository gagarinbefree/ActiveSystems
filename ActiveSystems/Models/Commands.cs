using ActiveSystems.Contracts;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;

namespace ActiveSystems.Models
{
    public class Commands : ICommander
    {
        private IMemoryCache _cache;

        private int canvasWidth = 400;
        private int canvasHeight = 400;
      
        public Commands(IMemoryCache cache)
        {
            _cache = cache;
        }

        public ViewModel CreateModel()
        {
            ViewModel model = new ViewModel();

            model.Id = Guid.NewGuid().ToString();
            model.CanvasSize = new Point { X = canvasWidth, Y = canvasHeight };            
            model.CrossBar.Color = _getRandomColor();
            model.CrossBar.Points.Add(_getRandomPoint());
            model.CrossBar.Points.Add(_getRandomPoint());

            return model;
        }

        public void SaveModel(ViewModel model)
        {
            _cache.Set(model.Id, model);
        }

        public ViewModel LoadModel(string id)
        {
            ViewModel model;

            if (!_cache.TryGetValue(id, out model))
                model = CreateModel();

            model.CrossBar.Color = _getRandomColor();

            return model;
        }
        
        private string _getRandomColor()
        {
            Random rnd = new Random();
            KnownColor[] names = (KnownColor[])Enum.GetValues(typeof(KnownColor));
            KnownColor randomColorName = names[rnd.Next(names.Length)];

            return randomColorName.ToString();
        }

        private Point _getRandomPoint()
        {
            Point res = new Point();

            Random rnd = new Random();            
            res.X = rnd.Next(canvasWidth);
            res.Y = rnd.Next(canvasHeight);

            return res;
        }
    }
}
