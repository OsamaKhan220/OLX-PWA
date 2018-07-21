// Initialize Firebase
var config = {
    apiKey: "AIzaSyBvXN9yO7XppI5GZmAfXFdqVQQ414lLL3Y",
    authDomain: "olx-pwa.firebaseapp.com",
    databaseURL: "https://olx-pwa.firebaseio.com",
    projectId: "olx-pwa",
    storageBucket: "olx-pwa.appspot.com",
    messagingSenderId: "648455976904"
};

firebase.initializeApp(config);

// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();
// Get a reference to the storage service, which is used to create references in your storage bucket
var storage = firebase.storage();
// Retrieve Firebase Messaging object.
const messaging = firebase.messaging();

messaging.onMessage((payload) => {
    console.log('payload****');
    console.log(payload);
})

firebase.auth().onAuthStateChanged(function(user) {
    var btnAcc = document.getElementById('btnAcc');
    var btnAdPost  = document.getElementById('btnAdPost');
    if (user) {
        btnAcc.innerHTML = "<li><a href='javascript:void(0)' onclick='myAds()'><h5>MyAds</h5></a></li><li><a href='javascript:void(0)' onclick='myFavAds()'><h5>Favourites</h5></a></li><li><a href='javascript:void(0)' onclick='gotoMyMessages()'><h5>Messages</h5></a></li><li><a href='javascript:void(0)' onclick='logout()'><h5>Logout</h5></a></li>";
        btnAdPost.setAttribute('onClick','gotoAdForm()');
        messaging.requestPermission().then(function() {
            console.log('Notification permission granted.');
            return messaging.getToken()
        }).then(function(token) {
            console.log('currentToken****');
            console.log(token);
            db.collection('users').doc(user.uid).update({token:token});
        }).catch(function(err) {
            console.log('Unable to get permission to notify.', err);
        });
    }else {
        // btnAcc.innerHTML = "";
        btnAdPost.setAttribute('onClick','gotoSignIn()');
    }
});

function gotoSignIn() {
    window.location.assign( location.origin+'/src/templete/signin.html');
}
function gotoSignUp() {
    window.location.assign( location.origin+'/src/templete/signup.html');
}
function signUptoSignIn() {
    window.location = 'signin.html';
}
function gotoAdForm() {
    if (JSON.parse(localStorage.getItem('selectedAd'))) {
        localStorage.removeItem('selectedAd');
    }
    window.location.assign( location.origin+'/src/templete/adposting.html');
}
function gotoEditAdForm() {
    window.location = 'adposting.html';
}

function showLoader(){
    var loader = document.getElementById('preloadera');
    loader.style.display = 'block';
}

function hideLoader(){
    var loader = document.getElementById('preloadera');
    loader.style.display = 'none';
}

function showAlert(type,msg) {
    var mainDiv = document.getElementById('alertDiv');
    var alertDiv = document.createElement('div');
    var msgType = (type=='danger')?"Error":"Success";
    alertDiv.setAttribute('class',`alert alert-${type} alert-dismissible fade in`);
    alertDiv.innerHTML = `<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a> <strong>${msgType}:</strong> ${msg}`;
    mainDiv.appendChild(alertDiv);
}
async function signUp() {
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var pwd = document.getElementById('pwd').value;
    if(!name || !email || !pwd){
        hideLoader();
        showAlert('danger','missing fields!');
    }else {
        try {
            var res = await firebase.auth().createUserWithEmailAndPassword(email, pwd);
            await db.collection('users').doc(res.user.uid).set({name, email});
            window.location = '../../index.html';
        } catch (e) {
            hideLoader();
            console.log(e);
            showAlert('danger',e.message);
        }
    }
}

async function signIn() {
    showLoader();
    var email = document.getElementById('email').value;
    var pwd = document.getElementById('pwd').value;
    if(!email || !pwd){
        hideLoader();
        showAlert('danger','missing fields!');
    }else {
        try {
            var userInfo = await firebase.auth().signInWithEmailAndPassword(email, pwd);
            var favAds = await db.collection('favAds').doc(userInfo.user.uid).get();
            if(favAds.data()){
                localStorage.setItem('favAds',favAds.data().fav);
            }
            window.location = '../../index.html';
            hideLoader();
        }catch (e) {
            hideLoader();
            console.log(e);
            showAlert('danger',e.message);
        }
    }
}
async function logout(){
    try {
        var fav = localStorage.getItem('favAds');
        if (fav){
            await db.collection('favAds').doc(firebase.auth().currentUser.uid).set({fav});
            localStorage.removeItem('favAds');
        }
        await firebase.auth().signOut();
        window.location.assign( location.origin+'/index.html');
    }catch (e) {
        console.log(e);
    }
}

function saveAd() {
    var title = document.getElementById('title');
    var category = document.getElementById('category');
    var price = document.getElementById('price');
    var description = document.getElementById('description');
    var photos = document.getElementById('photos').files[0];
    var name = document.getElementById('name');
    var number= document.getElementById('number');
    var city= document.getElementById('city');
    var area = document.getElementById('area');
    showLoader();
    if(!title.value || category.value == "0" || !price.value || !description.value || !photos || !name.value || !number.value || !city.value || !area.value){
        showAlert('danger','missing fields!');
        hideLoader();
    }else {
        var storageRef = storage.ref('ads/'+Math.random().toString().substring(2,6)+photos.name);
        var uploadTask = storageRef.put(photos);
        var imgRef = storageRef.fullPath;
        uploadTask.then(function(res) {
            storageRef.getDownloadURL().then(function(imgUrl) {
                var data = {
                    title:title.value,
                    category:category.value,
                    price:price.value,
                    description:description.value,
                    imgUrl, imgRef,
                    name:name.value,
                    number:number.value,
                    city:city.value,
                    area:area.value,
                    uid:firebase.auth().currentUser.uid
                };
                db.collection("ads").add(data).then(function(res){
                    console.log(res);
                    localStorage.setItem('selectedAd',JSON.stringify({id:res.id,data:data}));
                    title.value ='';
                    category.value ='0';
                    price.value ='';
                    description.value ='';
                    photos.name ='';
                    name.value ='';
                    number.value ='';
                    city.value = '';
                    area.value = '';
                    window.location.assign( location.origin+'/src/templete/ad.html');
                    hideLoader();
                });
            });
        });
    }
}
// function setCategoryfunc(){
//     var catUl = document.getElementById('catUl');
//     console.log(catUl.childElementCount)
//     for (let i = 0; i < catUl.childElementCount; i++) {
//         catUl.children[i].setAttribute('onclick','getCategoryAds(this)')
//     }
// }
async function getCategoryAds(category) {
    showLoader();
    var categoryAds = await db.collection("ads").where("category", "==", category).get()
    var ads = [];
    categoryAds .forEach(function(doc) {
        ads.push({id:doc.id,data:doc.data()});
    });
    localStorage.setItem('ads',JSON.stringify(ads));
    window.location = 'src/templete/searchads.html';
}
function searchAds() {
    showLoader();
    var txtSearch = document.getElementById('txtSearch').value.toLowerCase();
    var ads = [];
    db.collection("ads").get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                if(doc.data().title.toLowerCase().indexOf(txtSearch) != -1){
                    ads.push({id:doc.id,data:doc.data()});
                }
            });
            localStorage.setItem('ads',JSON.stringify(ads));
            window.location = 'src/templete/searchads.html';
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
}
function getAds() {
    var adsUl = document.getElementById('adsUl');
    var ads = JSON.parse(localStorage.getItem('ads'));
    var favAds = JSON.parse(localStorage.getItem('favAds'));
    if (ads){
        for (let i = 0; i <ads.length ; i++) {
            var mainDiv = document.createElement('div');
            var imgDiv = document.createElement('div');
            var dataDiv = document.createElement('div');
            var favDiv = document.createElement('div');
            var img  = document.createElement('img');
            var h3  = document.createElement('h3');
            var p  = document.createElement('p');
            var h5  = document.createElement('h5');
            var favBtn = document.createElement('span');

            if (favAds && favAds.length){
                for (let j = 0; j < favAds.length; j++) {
                    if (favAds[j].id == ads[i].id){
                        favBtn.innerHTML = '<svg height="25" aria-hidden="true" data-prefix="fas" data-icon="heart" class="svg-inline--fa fa-heart fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="red" fav="yes" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path></svg>';
                        favBtn.firstElementChild.setAttribute('onclick',`favAd(${i},this)`);
                        break;
                    }else {
                        favBtn.innerHTML = '<svg height="25" aria-hidden="true" data-prefix="fas" data-icon="heart" class="svg-inline--fa fa-heart fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path></svg>';
                        favBtn.firstElementChild.setAttribute('onclick',`favAd(${i},this)`);
                    }
                }
            }else {
                favBtn.innerHTML = '<svg height="25" aria-hidden="true" data-prefix="fas" data-icon="heart" class="svg-inline--fa fa-heart fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path></svg>';
                favBtn.firstElementChild.setAttribute('onclick',`favAd(${i},this)`);
            }
            mainDiv.setAttribute('class','boxex shade my-3');
            imgDiv.setAttribute('class','pbox1');
            dataDiv.setAttribute('class','pbox2');
            favDiv.setAttribute('class','boxex');
            img.setAttribute('width','100px');
            // img.src = '/src/images/load.gif';
            img.src = ads[i].data.imgUrl;
            h3.innerHTML = ads[i].data.title;
            p.innerHTML = ads[i].data.area+' >'+ads[i].data.city;
            h5.innerHTML = 'Rs '+ads[i].data.price;
            h3.onclick=function(){
                localStorage.setItem('selectedAd',JSON.stringify(ads[i]));
                window.location = 'ad.html';
            }

            dataDiv.appendChild(h3);
            dataDiv.appendChild(p);
            dataDiv.appendChild(document.createElement('br'));
            favDiv.appendChild(h5);
            favDiv.appendChild(document.createElement('h2'));
            favDiv.appendChild(favBtn);
            dataDiv.appendChild(favDiv);
            imgDiv.appendChild(img);
            mainDiv.appendChild(imgDiv);
            mainDiv.appendChild(dataDiv);
            adsUl.appendChild(mainDiv);
        }
    }
}

function getSelectedAd() {
    var ad = JSON.parse(localStorage.getItem('selectedAd')).data;
    var adImg = document.getElementById('adImg');
    var userDiv = document.getElementById('userDiv');
    var msgDiv = document.getElementById('msgDiv');
    var title = document.getElementById('title');
    var price = document.getElementById('price');
    var price2 = document.getElementById('price2');
    var area  = document.getElementById('area');
    var desc  = document.getElementById('desc');
    var numb = document.getElementById('num')
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            if (ad.uid == user.uid){
                userDiv.setAttribute('class','show');
            }else if (ad.uid != user.uid){
                msgDiv.setAttribute('class','show');
            }
        }
    });

    adImg.src = ad.imgUrl;
    title.innerHTML = ad.title;
    price2.append(ad.price);
    price.append(ad.price);
    desc.append(ad.description);
    numb.append(ad.number);
    area.append(ad.area+', '+ad.city) ;
}

function myAds() {
    var ads = [];
    showLoader();
    db.collection("ads").where("uid", "==", firebase.auth().currentUser.uid).get()
        .then(res => {
            res.forEach(function (doc) {
                ads.push({id:doc.id,data:doc.data()});
            });
            localStorage.setItem('ads',JSON.stringify(ads));
            window.location.assign( location.origin+'/src/templete/myads.html')
        }).catch(e => {
        console.log(e);
    });
}


function getEditFormData() {
    var selectedAd = JSON.parse(localStorage.getItem('selectedAd'));
    var title = document.getElementById('title');
    var category = document.getElementById('category');
    var price = document.getElementById('price');
    var description = document.getElementById('description');
    var name = document.getElementById('name');
    var number= document.getElementById('number');
    var city= document.getElementById('city');
    var area = document.getElementById('area');
    var formBtn = document.getElementById('formBtn');
    var photo = document.getElementById('photo');

    if (selectedAd) {
        // formBtn.setAttribute('class','btn btn-success form-control');
        formBtn.innerHTML = 'Update';
        formBtn.setAttribute('onclick',' updateAd()');
        photo.setAttribute('class','hide');
        title.value = selectedAd.data.title;
        category.value = selectedAd.data.category;
        price.value = selectedAd.data.price;
        description.value = selectedAd.data.description;
        name.value = selectedAd.data.name;
        number.value = selectedAd.data.number;
        city.value = selectedAd.data.city;
        area.value = selectedAd.data.area;
    }
}

function updateAd() {
    var selectedAd = JSON.parse(localStorage.getItem('selectedAd'));
    var uTitle = document.getElementById('title');
    var uCategory = document.getElementById('category');
    var uPrice = document.getElementById('price');
    var uDescription = document.getElementById('description');
    var uName = document.getElementById('name');
    var uNumber= document.getElementById('number');
    var uCity= document.getElementById('city');
    var uArea = document.getElementById('area');

    if(!uTitle.value || uCategory.value == "0" || !uPrice.value || !uDescription.value || !uName.value || !uNumber.value || !uCity.value || !uArea.value){
        showAlert('danger','missing fields!');
        hideLoader();
    }else {
        showLoader();
        db.collection("ads").doc(selectedAd.id).update({
            title:uTitle.value,
            category:uCategory.value,
            price:uPrice.value,
            description:uDescription.value,
            name:uName.value,
            number:uNumber.value,
            city:uCity.value,
            area:uArea.value
        }).then(function(res) {
            selectedAd.data = {
                title:uTitle.value,
                category:uCategory.value,
                price:uPrice.value,
                description:uDescription.value,
                imgUrl:selectedAd.data.imgUrl,
                imgRef:selectedAd.data.imgRef,
                uid:selectedAd.data.uid,
                name:uName.value,
                number:uNumber.value,
                city:uCity.value,
                area:uArea.value
            };
            localStorage.setItem('selectedAd',JSON.stringify(selectedAd));
            uTitle.value = '';
            uCategory.value = '0';
            uPrice.value = '';
            uDescription.value = '';
            uName.value = '';
            uNumber.value = '';
            uCity.value = '';
            uArea.value = '';
            window.location.assign( location.origin+'/src/templete/ad.html');
        });
    }
}

function deleteAd() {
    showLoader()
    var selectedAd = JSON.parse(localStorage.getItem('selectedAd'));
    // var desertRef = storageRef.child('images/desert.jpg');
    var storageRef = storage.ref(selectedAd.data.imgRef);
    storageRef.delete().then(function() {
        console.log('File deleted successfully');
        db.collection("ads").doc(selectedAd.id).delete().then(function() {
            console.log("Document successfully deleted!");
            localStorage.removeItem('selectedAd');
            myAds();
        }).catch(function(error) {
            console.error("Error removing document: ", error);
        });
    }).catch(function(error) {
        // Uh-oh, an error occurred!
        console.log(error)
    });
}
function favAd(index,elem){
    var ads = JSON.parse(localStorage.getItem('ads'));
    var oldFav = JSON.parse(localStorage.getItem('favAds'));
    var favAds = [];
    // console.log(elem.firstElementChild.hasAttribute('fav'));
    if (!elem.firstElementChild.hasAttribute('fav')){
        elem.firstElementChild.setAttribute('fill','red');
        elem.firstElementChild.setAttribute('fav','yes');
        if (oldFav){
            favAds = oldFav;
        }
        favAds.push(ads[index]);
    }
    else if (elem.firstElementChild.hasAttribute('fav')) {
        elem.firstElementChild.removeAttribute('fav');
        elem.firstElementChild.setAttribute('fill','currentColor');
        for (let i = 0; i < oldFav.length; i++) {
            if (oldFav[i].id == ads[index].id){
                oldFav.splice(i,1);
                break;
            }
        }
        favAds = oldFav
    }
    localStorage.setItem('favAds',JSON.stringify(favAds));
}
function myFavAds() {
    showLoader()
    var favAds = JSON.parse(localStorage.getItem('favAds'));
    localStorage.setItem('ads',JSON.stringify(favAds));
    window.location.assign( location.origin+'/src/templete/favads.html')
}
function gotoMessage() {
    // showLoader();
    var selectedAd = JSON.parse(localStorage.getItem('selectedAd'));

    db.collection('chatRooms').where('ad_id','==',selectedAd.id).get()
        .then(res=>{
            res.forEach(function (doc) {
                for (let i = 0; i < 2; i++) {
                    if (doc.data().users[i] == firebase.auth().currentUser.uid){
                        localStorage.setItem('currentRoomInfo',JSON.stringify({id:doc.id,sender:firebase.auth().currentUser.uid,reciver:selectedAd.data.uid}));
                        window.location.assign(location.origin+'/src/templete/message.html');
                    }
                }
            });
            //Creating room info
            db.collection('chatRooms').add({
                createdAt: new Date(),
                users: [firebase.auth().currentUser.uid, selectedAd.data.uid],
                ad_id: selectedAd.id
            }).then(res => {
                localStorage.setItem('currentRoomInfo',JSON.stringify({id:res.id,sender:firebase.auth().currentUser.uid,reciver:selectedAd.data.uid}));
                window.location.assign(location.origin+'/src/templete/message.html');
            })
        }).catch(e=>{
            console.log(e)
        })
}

function catd()
{
    var div = document.getElementById('catDiv');
    var style = getComputedStyle(div);
    var state = style.getPropertyValue('display');
    if(state == 'none')
    {
        div.style.display = 'block';
    }
    else if(state == 'block')
    {
        div.style.display = 'none';
    }
}

function send()
{
    var text = document.getElementById('inT');
    var chatInfo = JSON.parse(localStorage.getItem('currentRoomInfo'));

    if(text.value){
        // Sending message!
        db.collection('chatRooms').doc(chatInfo.id).collection('messages').add({
            message: text.value,
            sender: chatInfo.sender,
            receiver: chatInfo.reciver,
            createdAt: Date.now()
        }).then(res=>{
            db.collection('users').doc(chatInfo.reciver).get().then(function (res) {
                if(res.data().token){
                    db.collection('users').doc(chatInfo.sender).get()
                        .then(user => {
                            var notification = {
                                'title': 'OLX',
                                'body': user.data().name+': '+text.value,
                                'icon' : 'src/images/favicon/256.png',
                                'click_action' : 'https://olx-pwa.firebaseapp.com/src/templete/message.html#'+chatInfo.id+'#'+chatInfo.sender+'#'+chatInfo.reciver
                            };
                            fetch('https://fcm.googleapis.com/fcm/send', {
                                'method': 'POST',
                                'headers': {
                                    'Authorization': 'key=AIzaSyDHYbm-WjWxWV7JqjFnt3EZMOa3EHMXFDg',
                                    'Content-Type': 'application/json'
                                },
                                'body': JSON.stringify({
                                    'notification': notification,
                                    'to': res.data().token,
                                })
                            }).then(function(response) {
                                text.value = '';
                                console.log(response);
                            }).catch(function(error) {
                                console.error(error);
                            });
                        })
                }
            })
        }).catch(e=>{
            console.log(e);
        })
    }
}

function gotoMyMessages() {
    window.location.assign(location.origin+'/src/templete/mymessages.html');
}

function getMyChats() {
    showLoader();
    var mainDiv = document.getElementById('mainDiv');
    db.collection('chatRooms').get()
        .then(res=>{
            res.forEach(function (doc) {
                var div = document.createElement('div');
                var divImg = document.createElement('div');
                var divP = document.createElement('div');
                var divP2 = document.createElement('div');
                var msgReciver;
                var img = document.createElement('img');
                var nameP = document.createElement('p');
                var timeP = document.createElement('p');
                var msgP = document.createElement('p');
                divP.setAttribute('class','contP');
                divImg.setAttribute('class','contImg');
                divP2.setAttribute('class','contN');
                div.setAttribute('class','contDiv1');
                nameP.setAttribute('class','contP1');
                timeP.setAttribute('class','contN1');
                msgP.setAttribute('class','contP2');

                img.src = '../images/person.png';
                for (let i = 0; i < 2; i++) {
                    if (doc.data().users[i] == firebase.auth().currentUser.uid){
                        db.collection('chatRooms').doc(doc.id).collection('messages').orderBy("createdAt","desc").limit(1).get()
                            .then(res=>{
                                res.forEach(function (msgDoc) {
                                    msgP.innerHTML = msgDoc.data().message;
                                    timeP.innerHTML = new Date(msgDoc.data().createdAt).toLocaleTimeString();
                                });
                                divP.append(msgP);
                            });
                        for (let j = 0; j < 2; j++) {
                            if(doc.data().users[j] != firebase.auth().currentUser.uid){
                                msgReciver = doc.data().users[j];
                                db.collection('users').doc(doc.data().users[j]).get()
                                    .then(res=>{
                                        nameP.innerHTML = res.data().name;
                                    });
                                divP.append(nameP);
                            }
                        }
                        divImg.append(img);
                        divP2.append(timeP);
                        div.append(divImg);
                        div.append(divP);
                        div.append(divP2);
                        mainDiv.append(div);
                    }
                }
                div.onclick = function(){
                    db.collection('ads').doc(doc.data().ad_id).get()
                        .then(res=>{
                            localStorage.setItem('currentRoomInfo',JSON.stringify({id:doc.id,sender:firebase.auth().currentUser.uid,reciver:msgReciver}));
                            window.location.assign(location.origin+'/src/templete/message.html');
                        })
                };
            });
            hideLoader();
        }).catch(e=>{
        console.log(e);
    })
}

function getOldChat() {
    showLoader();
    var mainDiv  = document.getElementById('cont');
    if(window.location.hash){
        var allHashs = window.location.hash;
        var hashs = allHashs.split('#');
        localStorage.setItem('currentRoomInfo',JSON.stringify({id:hashs[1],reciver:hashs[2],sender:hashs[3]}));
    }
    var chatInfo = JSON.parse(localStorage.getItem('currentRoomInfo'));
    db.collection('chatRooms').doc(chatInfo.id).collection('messages').orderBy("createdAt")
        .onSnapshot(function(snapshot) {
            snapshot.docChanges().forEach(function (change) {
                if (change.type === "added") {
                    if (change.doc.data().receiver == firebase.auth().currentUser.uid){
                        var textDiv = document.createElement('div');
                        var p = document.createElement('p');
                        p.innerHTML = change.doc.data().message;
                        textDiv.setAttribute('class','text');
                    }else if(change.doc.data().sender == firebase.auth().currentUser.uid){
                        var textDiv = document.createElement('div');
                        var p = document.createElement('p');
                        p.innerHTML = change.doc.data().message;
                        textDiv.setAttribute('class','text2');
                    }
                    textDiv.append(p);
                    mainDiv.append(textDiv);
                }
            });
            hideLoader();
        });
}
function randomAds() {
    var ads = [];
    db.collection("ads").limit(6).get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                ads.push({id:doc.id,data:doc.data()});
            });
            localStorage.setItem('ads',JSON.stringify(ads));
            var adsUl = document.getElementById('adsUl');
            var favAds = JSON.parse(localStorage.getItem('favAds'));
            for (let i = 0; i <ads.length ; i++) {
                var mainDiv = document.createElement('div');
                var imgDiv = document.createElement('div');
                var dataDiv = document.createElement('div');
                var favDiv = document.createElement('div');
                var img  = document.createElement('img');
                var h3  = document.createElement('h3');
                var p  = document.createElement('p');
                var h5  = document.createElement('h5');
                var favBtn = document.createElement('span');

                if (favAds && favAds.length){
                    for (let j = 0; j < favAds.length; j++) {
                        if (favAds[j].id == ads[i].id){
                            favBtn.innerHTML = '<svg height="25" aria-hidden="true" data-prefix="fas" data-icon="heart" class="svg-inline--fa fa-heart fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="red" fav="yes" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path></svg>';
                            favBtn.firstElementChild.setAttribute('onclick',`favAd(${i},this)`);
                            break;
                        }else {
                            favBtn.innerHTML = '<svg height="25" aria-hidden="true" data-prefix="fas" data-icon="heart" class="svg-inline--fa fa-heart fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path></svg>';
                            favBtn.firstElementChild.setAttribute('onclick',`favAd(${i},this)`);
                        }
                    }
                }else {
                    favBtn.innerHTML = '<svg height="25" aria-hidden="true" data-prefix="fas" data-icon="heart" class="svg-inline--fa fa-heart fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path></svg>';
                    favBtn.firstElementChild.setAttribute('onclick',`favAd(${i},this)`);
                }
                mainDiv.setAttribute('class','boxex shade my-3');
                imgDiv.setAttribute('class','pbox1');
                dataDiv.setAttribute('class','pbox2');
                favDiv.setAttribute('class','boxex');
                img.setAttribute('width','100px');
                // img.src = '/src/images/load.gif';
                img.src = ads[i].data.imgUrl;
                h3.innerHTML = ads[i].data.title;
                p.innerHTML = ads[i].data.area+' >'+ads[i].data.city;
                h5.innerHTML = 'Rs '+ads[i].data.price;
                h3.onclick=function(){
                    localStorage.setItem('selectedAd',JSON.stringify(ads[i]));
                    window.location.assign( location.origin+'/src/templete/ad.html');
                }

                dataDiv.appendChild(h3);
                dataDiv.appendChild(p);
                dataDiv.appendChild(document.createElement('br'));
                favDiv.appendChild(h5);
                favDiv.appendChild(document.createElement('h2'));
                favDiv.appendChild(favBtn);
                dataDiv.appendChild(favDiv);
                imgDiv.appendChild(img);
                mainDiv.appendChild(imgDiv);
                mainDiv.appendChild(dataDiv);
                adsUl.appendChild(mainDiv);
            }
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
}
if ('serviceWorker' in navigator) {

    navigator.serviceWorker
        .register('../../service-worker.js')
        .then(function() { console.log('Service Worker Registered'); })
        .catch(function (e) { console.log(e); });
}

