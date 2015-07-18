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
		res.render('quizes/index.ejs',{quizes: quizes, errors: [] });
	})
};

//GET /quizes/:id
exports.show = function(req, res){	
	models.Quiz.find(req.params.quizId).then(function(quiz){		
		res.render('quizes/show', {quiz: req.quiz, errors: []})
	})
};

//GET /quizes/:id/answer
exports.answer = function(req, res){
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta){
		resultado = 'Correcto';
	}
	res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});		
};

exports.new = function(req, res){
	var quiz = models.Quiz.build( //crea objeto quiz
		{pregunta:"Pregunta", respuesta:"Respuesta"}
	);
	res.render('quizes/new', {quiz: quiz, errors: [] });
};

//POST /quizes/create
exports.create = function(req,res){
	var quiz = models.Quiz.build(req.body.quiz);
	
	quiz.validate().then(function(err){
		if (err){
			res.render('quizes/new', {quiz: quiz, errors: err.errors});
		} else{
			//guarda en BD los campos pregunta y respuesta de quiz
			quiz.save({fields: ["pregunta", "respuesta"]})
			.then(function(){res.redirect('/quizes')})
			//Redirección HTTP (URL relativo) lista de preguntas	
			}			
		}	
	);
};

//GET quizes/:id/edit
exports.edit = function (req,res){
	var quiz = req.quiz; //autoload de instancia de quiz
	res.render('quizes/edit', {quiz: quiz, errors: []});
}

//PUT / quizes/:id
exports.update = function(req,res){
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	
	req.quiz.validate().then(
		function(err){
			if (err){
				res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
			} else {
				req.quiz.save( // save: guarda campos pregunta y respuesta en BD
					{fields: ["pregunta","respuesta"]})
					.then(function(){res.redirect('/quizes');});
			}
		}
	);			
};

//DELETE /quizes/:id
exports.destroy = function(req,res){
	req.quiz.destroy().then(function(){
		res.redirect('/quizes');
	}).catch(function(error){next(error)});
};