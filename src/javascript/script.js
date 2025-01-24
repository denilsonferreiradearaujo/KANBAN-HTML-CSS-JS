// Recupera os dados salvos no Local Storage
function loadCardsFromLocalStorage() {
    const storedCards = JSON.parse(localStorage.getItem("kanbanCards")) || [];
  
    // Para cada card salvo, recria o elemento e adiciona à coluna correta
    storedCards.forEach((card) => {
      const column = document.querySelector(`.kanban-column[data-id="${card.column}"] .kanban-cards`);
      const newCard = createCardElement(card.title, card.priority);
      column.appendChild(newCard);
    });
  }
  
  // Função para criar o elemento HTML de um card
  function createCardElement(title, priority) {
    const newCard = document.createElement("div");
    newCard.className = "kanban-card";
    newCard.setAttribute("draggable", "true");
    newCard.innerHTML = `
    <div class="badge ${priority}">
      <select class="priority">
        <option value="high" ${priority === "high" ? "selected" : ""}>Alta</option>
        <option value="medium" ${priority === "medium" ? "selected" : ""}>Média</option>
        <option value="low" ${priority === "low" ? "selected" : ""}>Baixa</option>
      </select>
    </div>
    <input type="text" class="card-title" value="${title}">
    <div class="card-infos">
      <div class="card-icons">
        <p><i class="fa-regular fa-comment"></i> 0</p>
        <p><i class="fa-solid fa-paperclip"></i> 0</p>
      </div>
      <div class="user">
        <img src="src/images/avatar-feminino-1.png" alt="Avatar">
      </div>
    </div>
    <button class="save-edits">Salvar Edições</button>
  `;

  
    // Adicionar eventos de drag and drop ao novo card
    newCard.addEventListener("dragstart", (e) => {
      e.currentTarget.classList.add("dragging");
    });
  
    newCard.addEventListener("dragend", (e) => {
      e.currentTarget.classList.remove("dragging");
    });
  
    // Evento para salvar as edições
  newCard.querySelector(".save-edits").addEventListener("click", () => {
    const updatedTitle = newCard.querySelector(".card-title").value.trim();
    const updatedPriority = newCard.querySelector(".priority").value;

    if (!updatedTitle) {
      Toastify({
        text: "O título não pode estar vazio!",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, rgb(216, 162, 167), #ffc371)",
      }).showToast();
      return;
    }

    // Atualizar a aparência da badge de prioridade
    const badge = newCard.querySelector(".badge");
    badge.className = `badge ${updatedPriority}`;
    badge.querySelector("select").value = updatedPriority;

    // Salvar os dados no Local Storage
    saveCardsToLocalStorage();

    Toastify({
      text: "Edições salvas com sucesso!",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(to right, #56ab2f, #a8e063)",
    }).showToast();
  });

  return newCard;
}

  // Salva os cards no Local Storage
  function saveCardsToLocalStorage() {
    const cards = [];
  
    document.querySelectorAll(".kanban-column").forEach((column) => {
      const columnId = column.getAttribute("data-id");
      const cardsInColumn = column.querySelectorAll(".kanban-card");
  
      cardsInColumn.forEach((card) => {
        const title = card.querySelector(".card-title").value;
        const priority = card.querySelector(".badge").classList[1]; // Ex.: 'high', 'medium', 'low'
        cards.push({ column: columnId, title, priority });
      });
    });
  
    localStorage.setItem("kanbanCards", JSON.stringify(cards));
  }
  
  
  // Adiciona um novo card ao clicar no botão "Salvar"
  document.querySelectorAll(".add-card").forEach((button) => {
    button.addEventListener("click", () => {
      const column = button.closest(".kanban-column");
      const cardsContainer = column.querySelector(".kanban-cards");
  
      const modal = document.createElement("div");
      modal.className = "modal";
      modal.innerHTML = `
        <div class="modal-content">
          <h2>Adicionar Novo Card</h2>
          <label for="title">Título:</label>
          <input type="text" id="title" name="title" required>
          <label for="priority">Prioridade:</label>
          <select id="priority" name="priority">
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
          <button class="save-card">Salvar</button>
          <button class="close-modal">Fechar</button>
        </div>
      `;
      document.body.appendChild(modal);
  
      modal.querySelector(".close-modal").addEventListener("click", () => {
        modal.remove();
      });
  
      modal.querySelector(".save-card").addEventListener("click", () => {
        const title = modal.querySelector("#title").value.trim();
        const priority = modal.querySelector("#priority").value;
  
        if (!title) {
          Toastify({
            text: "Preencha o título antes de salvar!",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right,rgb(216, 162, 167), #ffc371)",
          }).showToast();
          return;
        }
  
        const newCard = createCardElement(title, priority);
        cardsContainer.appendChild(newCard);
  
        saveCardsToLocalStorage(); // Atualiza o Local Storage após criar um card
        modal.remove();
      });
    });
  });
  
  // Adiciona os eventos necessários para drag and drop
  document.querySelectorAll(".kanban-cards").forEach((column) => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault(); // Permite o drop
      const draggingCard = document.querySelector(".dragging");
      const afterElement = getDragAfterElement(column, e.clientY);
      if (afterElement == null) {
        column.appendChild(draggingCard);
      } else {
        column.insertBefore(draggingCard, afterElement);
      }
    });
  
    column.addEventListener("drop", () => {
      saveCardsToLocalStorage(); // Salva o estado atualizado no Local Storage
    });
  });
  
  // Função auxiliar para posicionar os cards corretamente ao arrastar
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".kanban-card:not(.dragging)")];
  
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }
  
  // Carrega os cards salvos ao carregar a página
  loadCardsFromLocalStorage();
  