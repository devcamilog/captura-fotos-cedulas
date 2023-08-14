const webCamElement = document.getElementById("webCam");
const canvasElement = document.getElementById("canvas");
let frontData = null;
let backData = null;

// Enumerar y obtener las cámaras disponibles
async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(device => device.kind === 'videoinput');
    return cameras;
  } catch (error) {
    console.error("Error al obtener las cámaras:", error);
    return [];
  }
}

// Rellenar el dropdown con las cámaras disponibles
async function fillCameraDropdown() {
  const cameraDropdown = document.getElementById("cameraDropdown");
  cameraDropdown.innerHTML = "";

  const cameras = await getCameras();
  cameras.forEach((camera, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.text = camera.label || `Cámara ${index + 0}`;
    cameraDropdown.appendChild(option);
  });

  if (cameras.length > 0) {
    // Cuando se selecciona una cámara, iniciar el video con esa cámara
    cameraDropdown.addEventListener("change", () => {
      const selectedCameraIndex = parseInt(cameraDropdown.value);
      startCamera(cameras[selectedCameraIndex].deviceId);
    });

    // Iniciar el video con la primera cámara de la lista
    startCamera(cameras[1].deviceId);
  } else {
    console.error("No se encontraron cámaras disponibles.");
  }
}

  // Iniciar la cámara seleccionada
async function startCamera(deviceId) {
  const constraints = {
    video: { deviceId: { exact: deviceId } }
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    webCamElement.srcObject = stream;
  } catch (error) {
    console.error("Error al iniciar la cámara:", error);
  }
}

fillCameraDropdown();

function tomarFoto() {
    let foto = webcam.snap();
    const formData = new FormData();
    formData.append('image', dataURItoBlob(foto));

    // Generar un nombre único para el archivo basado en la fecha y hora actual
    const fechaHoraActual = new Date().toISOString().replace(/[-:.]/g, "");
    const nombreArchivo = 'cedulita_' + fechaHoraActual + '.jpg';

    fetch('/guardar_imagen/', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Descargar la imagen directamente como respuesta del servidor
            response.blob().then(blob => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = nombreArchivo; // Utilizar el nombre único para el archivo descargado

                // Agregar el enlace temporal al DOM para simular un clic y descargar la imagen
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link); // Eliminar el enlace temporal del DOM después de la descarga
            });
        } else {
            alert('Error al guardar la imagen: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error en la solicitud:', error);
    });

    // Guardar la foto en la variable correspondiente según si es frontal o trasera
    if (!frontData) {
        frontData = foto;
    } else {
        backData = foto;
    }
}

function saveFrontImage() {
if (!frontData) {
  alert('No se ha tomado ninguna foto frontal.');
  return;
}

const cedula = prompt('Ingrese el número de cédula:');
if (!cedula) {
  alert('Debe ingresar un número de cédula válido.');
  return;
}

// Remover caracteres especiales del número de cédula para evitar problemas en el nombre del archivo
const cleanedCedula = cedula.replace(/[^a-zA-Z0-9]/g, '');

// Generar un nombre único para el archivo basado en la fecha, hora actual y número de cédula
const fechaHoraActual = new Date().toISOString().replace(/[-:.]/g, "");
const nombreArchivo = `cedulita_${cleanedCedula}_${fechaHoraActual}.jpg`;

const formData = new FormData();
formData.append('image', dataURItoBlob(frontData));
formData.append('cedula', cedula); // Agregar el número de cédula al FormData

fetch('/guardar_imagen/', {
  method: 'POST',
  body: formData,
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Descargar la imagen directamente como respuesta del servidor
      response.blob().then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo; // Utilizar el nombre único para el archivo descargado

        // Agregar el enlace temporal al DOM para simular un clic y descargar la imagen
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Eliminar el enlace temporal del DOM después de la descarga
      });
    } else {
      alert('Error al guardar la imagen: ' + data.error);
    }
  })
  .catch(error => {
    console.error('Error en la solicitud:', error);
  });
}

function deletePhoto() {
    canvas.style.display = 'none';
    webcam = null;
}

function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: mimeString });
}