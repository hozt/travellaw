function openModal(event) {
    const modalContainer = document.getElementById('modalContainer');
    modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg max-w-lg w-full">
          <h2 class="text-2xl font-bold mb-4">${event.title}</h2>
          <p class="text-gray-600 mb-4">
            ${dayjs(event.startDatetime).format('MMMM D, YYYY - h:mm A')}
            ${event.endDatetime ? ` to ${dayjs(event.endDatetime).format('h:mm A')}` : ''}
          </p>
          ${event.content ? `<p class="text-gray-700 mb-4">${event.content}</p>` : ''}
          ${event.featuredImage ? `<img src="${event.featuredImage.node.sourceUrl}" alt="${event.title}" class="w-full h-auto mb-4">` : ''}
          <button id="closeModal" class="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded">Close</button>
        </div>
      </div>
    `;

    document.getElementById('closeModal').addEventListener('click', closeModal);
  }

  function closeModal() {
    const modalContainer = document.getElementById('modalContainer');
    modalContainer.innerHTML = '';
  }

  // Add click event listeners to all "View Details" buttons
  document.querySelectorAll('.view-event-details').forEach(button => {
    button.addEventListener('click', () => {
      const event = JSON.parse(button.getAttribute('data-event'));
      openModal(event);
    });
  });

  // Check for event in URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const eventParam = urlParams.get('event');
  if (eventParam) {
    try {
      const event = JSON.parse(decodeURIComponent(eventParam));
      openModal(event);
    } catch (error) {
      console.error('Error parsing event from URL:', error);
    }
  }