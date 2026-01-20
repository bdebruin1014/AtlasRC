import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { UserPlus, Edit2, Trash2, Key } from 'lucide-react';

const UsersManagementPage = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'active',
      joinDate: '2024-01-15',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'User',
      status: 'active',
      joinDate: '2024-02-20',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'Manager',
      status: 'inactive',
      joinDate: '2024-01-10',
    },
  ]);

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: 'user',
    password: '',
  });

  const handleAddUser = () => {
    setEditingUser(null);
    setUserData({ name: '', email: '', role: 'user', password: '' });
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserData({ 
      name: user.name, 
      email: user.email, 
      role: user.role.toLowerCase(), 
      password: '' 
    });
    setShowUserModal(true);
  };

  const handleSaveUser = () => {
    if (!userData.name || !userData.email) return;

    if (editingUser) {
      // Update existing user
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, name: userData.name, email: userData.email, role: userData.role.charAt(0).toUpperCase() + userData.role.slice(1) }
          : u
      ));
    } else {
      // Add new user
      const newUser = {
        id: users.length + 1,
        name: userData.name,
        email: userData.email,
        role: userData.role.charAt(0).toUpperCase() + userData.role.slice(1),
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
      };
      setUsers([...users, newUser]);
    }

    setShowUserModal(false);
    setUserData({ name: '', email: '', role: 'user', password: '' });
  };

  const handleDeleteUser = (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleToggleStatus = (userId) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
        : u
    ));
  };

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Users Management</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-gray-600 mt-2">Manage user accounts, roles, and permissions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddUser}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>Manage all user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input placeholder="Search users..." className="flex-1" />
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(user.status)}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.joinDate}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                                <Edit2 className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleToggleStatus(user.id)}
                                className={user.status === 'active' ? 'text-orange-600' : 'text-green-600'}
                              >
                                {user.status === 'active' ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
              <CardDescription>Currently active user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">
                {users.filter((u) => u.status === 'active').length} active user(s)
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive">
          <Card>
            <CardHeader>
              <CardTitle>Inactive Users</CardTitle>
              <CardDescription>Deactivated user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">
                {users.filter((u) => u.status === 'inactive').length} inactive user(s)
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit User Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information and permissions' : 'Create a new user account'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={userData.role}
                onValueChange={(value) => setUserData({ ...userData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!editingUser && (
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={!userData.name || !userData.email}>
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagementPage;
