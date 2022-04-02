var O_temp_int_h1 = document.getElementById('temp_int').getElementsByTagName('h1')[0];
var O_temp_ext_h1 = document.getElementById('temp_ext').getElementsByTagName('h1')[0];

var O_max_temp_int_h1 = document.getElementById('maxint');
var O_max_temp_ext_h1 = document.getElementById('maxext');
var O_min_temp_int_h1 = document.getElementById('minint');
var O_min_temp_ext_h1 = document.getElementById('minext');

var O_p_alerte_int = document.getElementById('alerte_int');
var O_p_alerte_ext = document.getElementById('alerte_ext');

var O_menu_title = document.getElementById('menu_tilte');
var O_menu_loader = document.getElementById('menu_loader');

var O_logs = document.getElementById('log_list');

var I_TempInterieur = 0;
var I_TempExterieur = 0;

var I_Max_TempInterieur = Number(localStorage.getItem("maxint")) || -999;
var I_Max_TempExterieur = Number(localStorage.getItem("maxext")) || -999;

var I_Min_TempInterieur = Number(localStorage.getItem("minint")) || 999;
var I_Min_TempExterieur = Number(localStorage.getItem("minext")) || 999;

var V_interieur_dataStock = F_stringToArray(localStorage.getItem("intdatastock")) || [];
var V_exterieur_dataStock = F_stringToArray(localStorage.getItem("extdatastock")) || [];

var O_graphe1, O_graphe2;

function F_addLog(S_txt, S_type){
    S_type = 'log_' + S_type;
    O_logs.innerHTML = '<p class="' + S_type + '">' + S_txt + '</p>' + O_logs.innerHTML;
}

// Afficher les nouvelles valeurs sur la page
function loadDataOnDom(){
    O_temp_int_h1.innerHTML = I_TempInterieur + '°C';
    O_temp_ext_h1.innerHTML = I_TempExterieur + '°C';

    O_menu_loader.style.display = 'none';
    O_menu_title.style.display = 'block';

    if(I_TempInterieur > I_Max_TempInterieur){
        I_Max_TempInterieur = I_TempInterieur;
        localStorage.setItem("maxint", I_Max_TempInterieur);
        F_addLog('[INFO] Nouvelle température maximal intérieur', 'normal');
        F_loadGraphe1();
    }

    if(I_TempInterieur < I_Min_TempInterieur){
        I_Min_TempInterieur = I_TempInterieur;
        localStorage.setItem("minint", I_Min_TempInterieur);
        F_addLog('[INFO] Nouvelle température minimale intérieur', 'normal');
        F_loadGraphe1();
    }

    if(I_TempExterieur > I_Max_TempExterieur){
        I_Max_TempExterieur = I_TempExterieur;
        localStorage.setItem("maxext", I_Max_TempExterieur);
        F_addLog('[INFO] Nouvelle température maximal exterieur', 'normal');
        F_loadGraphe1();
    }

    if(I_TempExterieur < I_Min_TempExterieur){
        I_Min_TempExterieur = I_TempExterieur;
        localStorage.setItem("minext", I_Min_TempExterieur);
        F_addLog('[INFO] Nouvelle température minimale exterieur', 'normal');
        F_loadGraphe1();
    }

    O_max_temp_int_h1.innerHTML = I_Max_TempInterieur + '°C';
    O_min_temp_int_h1.innerHTML = I_Min_TempInterieur + '°C';
    O_max_temp_ext_h1.innerHTML = I_Max_TempExterieur + '°C';
    O_min_temp_ext_h1.innerHTML = I_Min_TempExterieur + '°C';

    F_addLog('[SUCCES] Affichage des nouvelles données sur le DOM', 'succes');
}

function F_arrayToString(array){
    return array.join(",");
}

function F_stringToArray(str){
    if(str == null){
      str = "";
    }
  
    return str.split(',');
} 

function F_setAlerte(I_temp_int, I_temp_ext){
    // Intérieur :

    if (I_temp_int > 22) {
        O_p_alerte_int.innerHTML = "alerte : Baissez le chauffage !";
        alert("alerte : Baissez le chauffage !");
    }

    if(I_temp_int > 50){
        O_p_alerte_int.innerHTML = "alerte : Appelez les pompiers ou arrêtez votre barbecue !";
        alert("alerte : Appelez les pompiers ou arrêtez votre barbecue !");
    }
    
    if(I_temp_int < 12){
            O_p_alerte_int.innerHTML = "alerte : montez le chauffage ou mettez un gros pull !";
            alert("alerte : montez le chauffage ou mettez un gros pull !");
    }
    
    if(I_temp_int < 0){
        O_p_alerte_int.innerHTML = "alerte : canalisations gelées, appelez SOS plombier et mettez un bonnet !";
        alert("alerte : canalisations gelées, appelez SOS plombier et mettez un bonnet !");
    }

    if(I_temp_int < 22 && I_temp_int > 12){
        O_p_alerte_int.innerHTML = "";
    }

    // Extérieur :

    if(I_temp_ext > 35){
        O_p_alerte_ext.innerHTML = "alerte : Hot Hot Hot !";
        alert("alerte : Hot Hot Hot !");
    }

    if(I_temp_ext < 0){
        O_p_alerte_ext.innerHTML = "alerte : Banquise en vue !";
        alert("alerte : Banquise en vue !");
    }

    if(I_temp_ext < 35 && I_temp_ext > 0){
        O_p_alerte_ext.innerHTML = "";
    }
}

// Récuperer les nouvelles valeur depuis l'API
function F_loadApiData(){
    const  reqXhr = new XMLHttpRequest();
    reqXhr.open('POST', 'https://hothothot.dog/api/capteurs', true);
   
    O_menu_loader.style.display = 'block';
    O_menu_title.style.display = 'none';

    F_addLog('[CHARGEMENT] Demande de nouvelles données à l\'API', 'normal');

    // Envoyer une requête au serveur API :
    reqXhr.setRequestHeader('Content-Type', 'application/json');
    reqXhr.send();

    reqXhr.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE) {
            //Récupération des données de l'API
            if (this.status === 200) {
                var O_data = JSON.parse(reqXhr.responseText);

                I_TempInterieur = O_data.capteurs[0].Valeur;
                I_TempExterieur = O_data.capteurs[1].Valeur;

                // Actualiser les alertes :
                F_setAlerte(I_TempInterieur, I_TempExterieur);

                V_interieur_dataStock.push(I_TempInterieur);
                V_exterieur_dataStock.push(I_TempExterieur);

                // Retirer le premère élément pour ne pas dépasser les 300 données :
                if(V_interieur_dataStock.length > 300){
                    V_interieur_dataStock.shift();
                }

                if(V_exterieur_dataStock.length > 300){
                    V_exterieur_dataStock.shift();
                }

                localStorage.setItem("intdatastock", F_arrayToString(V_interieur_dataStock));
                localStorage.setItem("extdatastock", F_arrayToString(V_exterieur_dataStock));

                F_loadGraphe2();

                F_addLog('[SUCCES] Nouvelles données enregistrées', 'succes');

                loadDataOnDom();
            }else{
                //Gestion d'erreur...
                F_addLog('[ERREUR] Aucune connexion avec l\'API', 'erreur');
            }
    
        }
    };

    setTimeout(F_loadApiData, 5000);
}

// Système d'onglets :
var O_butliste = document.getElementById('left_menu').getElementsByTagName('p');
var O_menu_tilte = document.getElementById('menu_tilte'); 

for (let I_index = 0; I_index < O_butliste.length; I_index++) {
    const O_but = O_butliste[I_index];
    
    O_but.addEventListener('click', ()=>{
        for (let I_index2 = 0; I_index2 < O_butliste.length; I_index2++) {
            const O_but1 = O_butliste[I_index2];
            O_div = document.getElementById(O_but1.dataset.div);
            O_div.style.display = 'none';
            O_but1.style.border = 'none';
        }

        O_div2 = document.getElementById(O_but.dataset.div);
        O_div2.style.display = 'grid';
        O_menu_tilte.innerHTML = O_but.innerHTML;
        O_but.style.borderBottom = '3px solid #5d56c8'
    });
}

function F_getNumbList(I_num){
    V_LIST = [];
    for (let I_index = 1; I_index <= I_num; I_index++){ V_LIST.push(I_index); };
    return V_LIST;
}

function F_getNumbArrayList(I_num, V_list){
    V_LIST = [];
    for (let I_index = 0; V_list.length - I_num + I_index < V_list.length; I_index++){ V_LIST.push(V_list[V_list.length - I_num + I_index]); };
    return V_LIST;
}

// Actualiser le graphe 1 :
function F_loadGraphe1(){
    F_addLog('[INFO] Actualisation du graphe1', 'normal');

    const O_data = {
        labels: ["Max Intérieur", "Min Intérieur", "Max Extérieur", "Min Extérieur"],
        datasets: [
          {
            label: 'Intérieur',
            data: [I_Max_TempInterieur, I_Min_TempInterieur, I_Max_TempExterieur, I_Min_TempExterieur],
            borderColor: ['rgb(255, 99, 132)', 'rgb(132, 99, 255)'],
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(132, 99, 255, 0.2)'],
            borderWidth: 2,
            borderRadius: 10,
            borderSkipped: false,
          }
      ]
    };
    
    var O_ctx_graphe1 = document.getElementById('graphe1').getContext('2d');
    var O_config = {
        type: 'bar',
        data: O_data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Max / Min'
            }
          }
        },
    };

    if(O_graphe1 === undefined){
        O_graphe1 = new Chart(O_ctx_graphe1, O_config);
    }else{
        O_graphe1.destroy();
        O_graphe1 = new Chart(O_ctx_graphe1, O_config);
    }
}

// Actualiser le graphe 2 :
function F_loadGraphe2(){
    F_addLog('[INFO] Actualisation du graphe2', 'normal');

    const O_data = {
        labels: F_getNumbList(15),
        datasets: [
          {
            label: 'Intérieurs',
            data: F_getNumbArrayList(15, V_interieur_dataStock),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 0.8)',
          },
          {
            label: 'Extérieurs',
            data: F_getNumbArrayList(15, V_exterieur_dataStock),
            backgroundColor: 'rgba(132, 99, 255, 0.5)',
            borderColor: 'rgba(132, 99, 255, 0.8)',
          }
      ]
    };
    
    var O_ctx_graphe2 = document.getElementById('graphe2').getContext('2d');
    var O_config = {
        type: 'line',
        data: O_data,
        options: {
            responsive: true,
            plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Dernières températures'
            }
            }
        },
    };
    
    if(O_graphe2 === undefined){
        O_graphe2 = new Chart(O_ctx_graphe2, O_config);
    }else{
        O_graphe2.destroy();
        O_graphe2 = new Chart(O_ctx_graphe2, O_config);
    }
}

F_loadApiData();
F_loadGraphe1();
F_loadGraphe2();