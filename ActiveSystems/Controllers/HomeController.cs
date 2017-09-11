using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ActiveSystems.Models;
using ActiveSystems.Contracts;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;

namespace ActiveSystems.Controllers
{
    public class HomeController : Controller
    {
        private string _key = "ActiveSystems.Id";
        private ICommander _cmd;

        public HomeController(ICommander cmd)
        {
            _cmd = cmd;
        }

        public IActionResult Index()
        {
            ViewModel model;
            if (!HttpContext.Request.Cookies.ContainsKey(_key))
            {
                model = _cmd.CreateModel();
                HttpContext.Response.Cookies.Append(_key, model.Id);
            }
            else
            {
                string id;
                HttpContext.Request.Cookies.TryGetValue(_key, out id);
                model = _cmd.LoadModel(id);
            }

            return View(model);
        }

        [HttpPost]
        public void PostModel(ViewModel model)
        {
            _cmd.SaveModel(model);
        }
    }
}
