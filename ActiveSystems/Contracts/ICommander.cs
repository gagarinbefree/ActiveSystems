using ActiveSystems.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ActiveSystems.Contracts
{
    public interface ICommander
    {
        ViewModel CreateModel();
        void SaveModel(ViewModel model);
        ViewModel LoadModel(string id);       
    }
}
