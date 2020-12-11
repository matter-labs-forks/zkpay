export function pickImage() {
  return new Promise(resolve => {
    const form = document.getElementById('file-picker');
    const input = form.querySelector('input');
    input.accept = 'application/png,application/jpg';
    input.onchange = e => {
      const [file] = e.target.files;
      const reader = new FileReader();
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.readAsDataURL(file);
    };
    form.reset();
    input.click();
  });
}
