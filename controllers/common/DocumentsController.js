'use strict';

var Document = require('../../model/common/documentsModel.js');

exports.list_all_documents = function(req, res) {
  Document.getAllDocument(function(err, documents) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', documents);
    res.send(documents);
  });
};

exports.list_all_sales_training_documents = function(req, res) {
  Document.getAllSalesTrainingDocument(function(err, documents) {
    console.log('controller')
    if (err)
      res.send(err);
      console.log('res', documents);
    res.send(documents);
  });
};


exports.create_a_documents = function(req, res) {
  var new_documents = new Document(req.body);
  //console.log(req.files);
  //handles null error 
   if(!new_documents){

            res.status(400).send({ error:true, message: 'Please provide documents name' });

    }
  else{
  Document.createDocument(req, function(err, documents) {
    if (err)
      res.send(err);
    res.json(documents);
  });
}
};


exports.read_a_documents = function(req, res) {
  Document.getDocumentById(req.params.id, function(err, documents) {
    if (err)
      res.send(err);
    res.json(documents);
  });
};


exports.update_a_documents = function(req, res) {
 Document.updateById(req.params.id, new Document(req.body), function(err, documents) {
    if (err)
      res.send(err);
    res.json(documents);
  });
};


exports.delete_a_documents = function(req, res) {
 Document.remove( req.params.id, function(err, documents) {
    if (err)
      res.send(err);
    res.json({ message: 'Document successfully deleted' });
  });
};