const express=require('express');
const morgan=require('morgan');
const {engine}=require('express-handlebars');
const path=require('path');
const session=require('express-session');
const MySQLStore=require('express-mysql-session')(session);
const {database}=require('./keys');
const passport=require('passport');
const flash=require('connect-flash');

//Inicializaciones
const app=express();
require('./lib/passport');

//Settings
app.set('port',process.env.PORT || 3000);
app.set('views',path.join(__dirname,'views'));
app.engine('.hbs',engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'),'layouts'),
    partialsDir: path.join(app.get('views'),'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine','.hbs');

//Middlewares
app.use(session({
    secret:'thisWebSecret',
    resave: false,
    saveUninitialized:false,
    store: new MySQLStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(passport.initialize())
app.use(passport.session())

//Variables globales
app.use((req,res,next)=>{
    app.locals.success=req.flash('success');
    app.locals.successf=req.flash('successf');
    app.locals.user = req.user;
    next()
});

//Rutas
app.use(require('./routes'));
app.use(require('./routes/authentication'));
app.use('/gestion',require('./routes/gestion'));

//Public
app.use(express.static(path.join(__dirname,'public')));

//Iniciar servidor
app.listen(app.get('port'),()=>{
    console.log(`Server on port ${app.get('port')}`);
});
