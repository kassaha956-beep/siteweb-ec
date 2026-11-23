function errorHandler(err, req, res, next) {
  console.error('[Error Handler]:', err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation des données.',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: 'Une entrée avec cette valeur existe déjà.',
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Une erreur interne est survenue sur le serveur.',
  });
}

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route introuvable: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
