require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
/////////main
const app = express();
const PORT = process.env.PORT || 3000
const client = new pg.Client(process.env.DATABASE_URL)
/////// uses 
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public')); 
app.set('view engine', 'ejs');
////// listen
client.connect()
.then(()=>{
    app.listen(PORT,()=>{
        console.log('i am running');
    })
})

///////routs///////////
app.get(notFoundHandler)
app.get(errorHandler)
app.get('/',indexhandler)
app.get('/search',searchHandler)
app.get('/add',addHandler)
app.get('/favorite',favoriteHandler)
app.get('/details/:id',detailsHandler)
app.put('/update/:id',updateHandler)
app.put('/delete/:id',deleteHandler)

////// routs handlers////
function indexhandler (req,res){
    res.render('index')
}

////// searchHandler////
function searchHandler (req,res){
    let {searchBy,keyword}=req.query
    let url = `https://www.googleapis.com/books/v1/volumes?q=${keyword}+in${searchBy}:${keyword}`
    superagent.get(url)
    .then(result=>{
      let books = result.body.items.map(val=>{
          return new Books(val)
      })
      res.render('result',{data:books})
    })

}

////////////////favoriteHandler//////////////
function favoriteHandler (req,res){
    let sql = 'SELECT * FROM booky';
    client.query(sql)
    .then((result)=>{
        console.log(result);
        res.render('favorite',{data:result.rows}
        )
    })

}
//////////////////addHandler///////////
function addHandler (req,res){
    let {title,authors,img,description}=req.query
    let sql = `INSERT INTO booky (title,authors,img,description) VALUES ($1,$2,$3,$4)`;
    let safevalues = [title,authors,img,description]
    client.query(sql,safevalues)
    .then(()=>{
        res.redirect('/favorite')
    })

}

///////////detailsHandler//////////
function detailsHandler (req,res){
    let param = req.params.id 
    let sql = `SELECT * FROM booky WHERE id =$1`;
    let safevalues = [param]
    client.query(sql,safevalues)
    .then(result=>{
        res.render('details',{data:result.rows[0]})
    })
}

////////////////////updateHandler////////////
function updateHandler (req,res){
    let param = req.params.id
    let {title,authors,img,description}=req.body
    let sql = 'UPDATE booky SET title=$1 , authors=$2 ,img=$3,description=$4 WHERE id =$5';
    let safevalues = [title,authors,img,description,param]
    client.query(sql,safevalues)
    .then(()=>{
        res.redirect(`/details/${param}`)
    })
}

//////////////deleteHandler/////
function deleteHandler (req,res){
    let param = req.params.id
    let sql = `DELETE FROM booky WHERE id =$1`;
    let safevalues = [param]
    client.query(sql,safevalues)
    .then(()=>{
        res.redirect('/favorite')
    })
}

function Books(val){
    this.title = val.volumeInfo.title
    this.authors = val.volumeInfo.authors
    this.description = val.volumeInfo.description
    this.img = val.volumeInfo.imageLinks.thumbnail
}
////////error handler////
function notFoundHandler (req,res){
    res.status(404).send('not found page')
}
function errorHandler (err,req,res){
    res.status(500).send(err)

}