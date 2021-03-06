const slugify = require("slugify");
const Article = require("../models/articleModel");
const errorHandler = require("../config/errorHandler");

exports.getAllArticles = async (req, res, next) => {
	try {
		let filter = {};
		if (req.params.userId) {
			filter = { user: req.params.userId };
		}

		const articles = await Article.find(filter);

		res.status(200).json({
			status: "success",
			results: articles.length,
			data: {
				articles
			}
		});
	} catch (error) {
		return next(errorHandler(error.message));
	}
};

exports.createArticle = async (req, res, next) => {
	try {
		if (!req.body.user) req.body.user = req.user.id;
		const article = await Article.create(req.body);
		res.status(201).json({
			status: "success",
			data: {
				article
			}
		});
	} catch (error) {
		return next(errorHandler(error.message));
	}
};

exports.getArticle = async (req, res, next) => {
	try {
		const { id } = req.params;

		const article = await Article.findById(id);

		if (!article) {
			return next(errorHandler("Article not found", "fail", 404));
		}

		res.status(200).json({
			status: "success",
			data: {
				article
			}
		});
	} catch (error) {
		return next(errorHandler(error.message));
	}
};

exports.updateArticle = async (req, res, next) => {
	try {
		const { id } = req.params;
		req.body.slug = slugify(req.body.title, { lower: true });
		const article = await Article.findByIdAndUpdate(id, req.body, {
			new: true,
			runValidators: true
		});

		if (!article) {
			return next(errorHandler("Article not found", "fail", 404));
		}

		res.status(200).json({
			status: "success",
			data: {
				article
			}
		});
	} catch (error) {
		return next(errorHandler(error.message));
	}
};

exports.deleteArticle = async (req, res, next) => {
	try {
		const article = await Article.findByIdAndDelete(req.params.id);

		if (!article) {
			return next(errorHandler("Article not found", "fail", 404));
		}

		res.status(204).json({
			status: "success",
			data: null
		});
	} catch (error) {
		return next(errorHandler(error.message));
	}
};

exports.checkOwnedArticle = async (req, res, next) => {
	try {
		const article = await Article.findById(req.params.id);
		console.log(article.user.id, req.user.id);
		if (article.user.id.toString() === req.user.id) return next();

		res.status(403).json({
			status: "fail",
			message: "You are not allowed to modify others articles"
		});
	} catch (error) {
		return next(errorHandler(error.message));
	}
};

exports.setMyId = (req, res, next) => {
	req.params.userId = req.user.id;
	next();
};
