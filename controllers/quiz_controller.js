var models = require('../models/models.js');

//Autoload - factoriza el código si la ruta incluye :quizId
exports.load = function(req,res,next,quizId){
	models.Quiz.find(quizId).then(function(quiz){
		if (quiz) {
			req.quiz = quiz;
			next();
		} else { next(new Error('No existe quizId = ' + quizId));}
	}).catch(function(error) {next(error);});
};

/**
 * Procesa una query de búsqueda para transformarla en una query SQL. Si la query no existe o está vacía, devuelve null.
 * @param query Query de búsqueda compuesta por una o más palabras.
 * @returns {String} Si la query no existe o está vacía devuelve null, en otro caso, devuelve cada palabra pasada a
 * mayúsculas y separada por un %. Ejemplo Capital Italia se convertiría en %CAPITAL%ITALIA%
 * @private
 */
_procesarSearch = function (query) {
    if (query) {
        return query.trim().replace(/(\w+)/g, '%$1%').replace(/\s+/g, '').replace(/%+/g, '%').toUpperCase()
    }
    return null;
};

//GET /quizes
exports.index = function(req,res){
	var search = _procesarSearch(req.query.search),
		whereSection = search ? {where: ["upper(pregunta) like ?", search]} : {};

	models.Quiz.findAll(whereSection).then(function(quizes){
		res.render('quizes/index.ejs',{quizes: quizes});
	})
};

//GET /quizes/:id
exports.show = function(req, res){	
	models.Quiz.find(req.params.quizId).then(function(quiz){		
		res.render('quizes/show', {quiz: req.quiz})
	})
};

//GET /quizes/:id/answer
exports.answer = function(req, res){
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta){
		resultado = 'Cocrrecto';
	}
	res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado});		
};

exports.new = function(req, res){
	var quiz = models.Quiz.build( //crea objeto quiz
		{pregunta:"Pregunta", respuesta:"Respuesta"}
	);
	res.render('quizes/new', {quiz: quiz});
};

//POST /quizes/create
exports.create = function(req,res){
	var quiz = models.Quiz.build(req.body.quiz);
	
	//guarda en BD los campos pregunta y respuesta de quiz
	quiz.save({fields: ["pregunta", "respuesta"]}).then(function(){
		res.redirect('/quizes');
	}) //Redirección HTTP (URL relativo) lista de preguntas
};