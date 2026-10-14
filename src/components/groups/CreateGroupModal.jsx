import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Avatar from '../common/Avatar';
import { mockContacts } from '../../data/mockUsers';
import { useGroupStore } from '../../stores/groupStore';
import { useChatStore } from '../../stores/chatStore';
import { useUiStore } from '../../stores/uiStore';
import { Check } from 'lucide-react';

export default function CreateGroupModal() {
  const { isCreateModalOpen, setCreateModalOpen, createGroup } = useGroupStore();
  const { conversations } = useChatStore();
  const { showToast } = useUiStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState([]);

  const toggleSelect = (id) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter(i => i !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Please enter a group name", "warning");
      return;
    }

    const selectedMembers = mockContacts
      .filter(c => selectedContactIds.includes(c.id))
      .map(c => ({ id: c.id, name: c.name, role: 'member', avatar: c.avatar }));

    const newGroup = createGroup({
      name: name.trim(),
      description: description.trim(),
      selectedMembers
    });

    showToast(`Group "${newGroup.name}" created!`, "success");
    setName('');
    setDescription('');
    setSelectedContactIds([]);
    setCreateModalOpen(false);
  };

  return (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={() => setCreateModalOpen(false)}
      title="Create New Group"
      description="Start a collaborative space with friends, colleagues, or community members."
    >
      <form onSubmit={handleCreate} className="flex flex-col gap-4">
        <Input
          label="Group Name"
          placeholder="e.g. Kigali Fintech Innovators"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Group Description (Optional)"
          placeholder="What is this group about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Member selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
            Add Members ({selectedContactIds.length} selected)
          </label>
          <div className="max-h-52 overflow-y-auto space-y-1 pr-1 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-slate-900">
            {mockContacts.map((contact) => {
              const isSelected = selectedContactIds.includes(contact.id);
              return (
                <div
                  key={contact.id}
                  onClick={() => toggleSelect(contact.id)}
                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-teal-50 dark:bg-brand-950/60' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar src={contact.avatar} alt={contact.name} size="sm" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{contact.name}</p>
                      <p className="text-[10px] text-slate-400">{contact.label || contact.phone}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    isSelected ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
}
