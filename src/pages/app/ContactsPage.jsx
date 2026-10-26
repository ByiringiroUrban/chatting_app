import React, { useState } from 'react';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { useContactStore } from '../../stores/contactStore';
import { useChatStore } from '../../stores/chatStore';
import { useCallStore } from '../../stores/callStore';
import { useUiStore } from '../../stores/uiStore';
import { useNavigate } from 'react-router-dom';
import { 
  Contact2, 
  Plus, 
  Search, 
  Star, 
  MessageSquare, 
  Phone, 
  Video, 
  Trash2, 
  Ban,
  Edit2
} from 'lucide-react';

export default function ContactsPage() {
  const { contacts, fetchContacts, addContact, updateContactNickname, toggleFavorite, toggleBlock, deleteContact, isLoading } = useContactStore();
  const { setActiveChatId } = useChatStore();
  const { startCall } = useCallStore();
  const { showToast } = useUiStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchContacts();
  }, []);

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+250 ');
  const [newLabel, setNewLabel] = useState('Client');

  const filtered = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search)) || 
    (c.label && c.label.toLowerCase().includes(search.toLowerCase()))
  );

  const { startDirectConversation } = useChatStore();

  const handleStartChat = async (contact) => {
    await startDirectConversation(contact);
    navigate('/app/chats');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingContact || !editName.trim()) return;
    updateContactNickname(editingContact.id, editName.trim(), editLabel.trim());
    showToast(`Updated nickname for ${editName.trim()}`, "success");
    setEditingContact(null);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      showToast("Name and phone number are required", "warning");
      return;
    }

    addContact({
      name: newName.trim(),
      phone: newPhone.trim(),
      label: newLabel
    });

    showToast(`Added ${newName} to your contacts`, "success");
    setNewName('');
    setNewPhone('+250 ');
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-bg-dark overflow-y-auto p-4 sm:p-6 lg:p-8 select-none">
      
      {/* Add Contact Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Contact"
        description="Add phone contacts with Rwanda country code (+250)."
      >
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-3.5">
          <Input
            label="Full Name"
            placeholder="e.g. Diane Mutoni"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            placeholder="+250 788 123 456"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            required
          />

          <Input
            label="Relationship / Label"
            placeholder="e.g. Lead Developer, Supplier, VIP"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />

          <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Contact
            </Button>
          </div>
        </form>
      </Modal>

      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Contact2 className="w-6 h-6 text-brand-700 dark:text-teal-400" />
              Contacts Directory
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your address book, favorite VIP partners, and block unwanted callers.
            </p>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Contact
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts by name, label or Rwandan phone number..."
            className="w-full max-w-md bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
          />
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((contact) => (
            <div
              key={contact.id}
              className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Avatar
                  src={contact.avatar}
                  alt={contact.name}
                  size="lg"
                  status={contact.status}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {contact.name}
                    </h3>
                    <button
                      onClick={() => toggleFavorite(contact.id)}
                      className={`p-0.5 ${contact.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`}
                      title={contact.isFavorite ? "Unfavorite" : "Favorite"}
                    >
                      <Star className={`w-3.5 h-3.5 ${contact.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{contact.phone}</p>
                  {contact.label && (
                    <Badge variant="brand" size="sm" className="mt-1">
                      {contact.label}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingContact(contact);
                    setEditName(contact.name);
                    setEditLabel(contact.label || '');
                  }}
                  className="p-2 text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-teal-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Rename Nickname"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleStartChat(contact)}
                  className="p-2 text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-teal-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Message"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => startCall(contact, 'voice')}
                  className="p-2 text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-teal-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Voice Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteContact(contact.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Delete Contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Edit Nickname Modal */}
      <Modal
        isOpen={!!editingContact}
        onClose={() => setEditingContact(null)}
        title="Edit Contact Nickname"
        description="This custom name is private to your account."
      >
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-3.5">
          <Input
            label="Private Nickname"
            placeholder="e.g. Architect Bob, Dr. Alice"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />

          <Input
            label="Label / Grouping"
            placeholder="e.g. VIP, Partner, Family"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
          />

          <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setEditingContact(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
