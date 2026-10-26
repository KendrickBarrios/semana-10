1. ¿Qué diferencia existe entre componente, prop y estado?
   Un componente de React es una unidad funcional, compuesta por sus imports, una función o clase que lleva el mismo nombre del componente (esta contiene código JavaScript o TypeScript que determina el comportamiento del componente, así como la estructura del mismo, definida en un bloque HTML dentro del return), y el export del propio componente.

2. ¿Por qué useEffect es adecuado para iniciar una consulta externa?
   Porque permite ejecutar código después que el componente se monta en pantalla, permite que la función se vuelva a ejecutar si uno de los parámetros cambia, y evita errores en caso de que un componente se desmonte antes que una petición finalice.

3. ¿Qué responsabilidades corresponden a React y cuáles a Spring Boot?
   React determina lo que el usuario ve y cómo lo ve, definiendo, a través del componente App, la petición realizada a Spring Boot, y la manera en que dicha información se muestra en el navegador.

4. ¿Cómo distinguirías un error de CORS, un 404 y una caída del servidor?
   Un error de CORS impide que la petición siquiera llegue a Spring Boot, por lo que este no mostraría nada en consola, y React no obtendría ninguna respuesta. Un 404 sí debe llegar y ser manejado por Spring Boot, devolviendo una respuesta con dicho código de error. Una caída del servidor haría que todas las requests al backend fallen, de modo que no se obtiene respuestas con ningún código.

5. ¿Qué mejorarías antes de publicar el sistema para usuarios reales?
   Reemplazar el manejo de datos en memoria por una base de datos real. Agregar validaciones de datos ingresados. Mejorar la interfaz mediante Tailwind y estilos personalizados. Cambiar el uso de Axios por la función nativa fetch, reemplazando por Axios solo si la aplicación crece y en verdad se necesitan las funciones que Axios provee.
