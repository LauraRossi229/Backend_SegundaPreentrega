import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import exphbs from 'express-handlebars';
import { fileURLToPath } from 'url'; // Importa fileURLToPath
import path from 'path'; 
import userRouter from './routes/users.routes.js';
import productRouter from './routes/products.routes.js';
import cartRouter from './routes/carts.routes.js';
import { messageRoutes } from './routes/messages.routes.js';


// Obtiene la ruta del directorio actual utilizando import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new socketIo(server);

app.use(express.json());

// Configura Handlebars como el motor de vistas
const hbs = exphbs.create({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
  partialsDir: path.join(__dirname, 'views/partials'),

});

// Registra la función 'hbs' como motor de vistas
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para limpiar la pantalla del navegador
app.use((req, res, next) => {
  if (req.query.clear === 'true') {
    // Redirige a la misma ruta sin el parámetro 'clear'
    return res.redirect(req.originalUrl.split('?')[0]);
  }
  next();
});

app.set('io', io);


// Configura el middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 8080;

mongoose.connect('mongodb+srv://rossil229:QPwoer5512122l@cluster0.oeqfqws.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('La base de datos se conectó con éxito');
    
    // Ahora que la conexión a la base de datos está establecida, puedes continuar con la configuración de las rutas y el servidor.
    app.use('/api/users', userRouter);
    app.use('/api/products', productRouter);
    app.use('/api/carts', cartRouter);
    app.use(messageRoutes);
    app.use('/', productRouter);
    app.use('/', cartRouter);
    
    io.on('connection', (socket) => {
      console.log('Un usuario se ha conectado al chat');

      socket.on('chat message', (message) => {
        console.log(`Mensaje recibido: ${message}`);
        io.emit('chat message', message);
      });

      socket.on('chat message response', function(response) {
        console.log('Respuesta del servidor:', response);
       io.emit('chat message response', 'Gracias, su mensaje fue enviado');
      });

      socket.on('disconnect', () => {
        console.log('Un usuario se ha desconectado del chat');
      });
    });

    // Ruta para la vista de chat
    app.get('/chat', (req, res) => {
      // Consulta todos los mensajes de la colección "messages"
  
      messageModel.find({}, (err, messages) => {
        if (err) {
          console.error(err);
        } else {
          // Renderiza la vista de chat y pasa los mensajes
          res.render('chat', { messages, messageSent: false });
        }
      });
    });

    // Ruta para manejar el envío del formulario y mostrar el mensaje de agradecimiento
    app.post('/chat', async (req, res) => {
      const { email, message } = req.body;

      try {
        // Guarda el mensaje en la colección "messages" de forma asíncrona
        const newMessage = new messageModel({ email, message });
        await newMessage.save();
        
        // Redirige de vuelta a la vista de chat con un parámetro para limpiar la pantalla
        res.redirect('/chat?clear=true');
      } catch (err) {
        console.error(err);
        res.status(500).send('Error al guardar el mensaje.');
      }
    });

    


    server.listen(PORT, () => {
      console.log(`Servidor en ejecución en el puerto ${PORT}`);
    });
  })
  .catch((error) => console.error('Error en la conexión a la base de datos:', error));
