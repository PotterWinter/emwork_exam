"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Ex101Page() {
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<string>("asc");
  const [prefix, setPrefix] = useState<string>("นาย");
  const [editMember, setEditMember] = useState<boolean>(false);
  const [editMemberData, setEditMemberData] = useState<any>(null);

  const [formData, setFormData] = useState({
    prefix: "",
    first_name: "",
    last_name: "",
    dob: "",
    profile_picture: "",
  });

  const fetchMembers = async () => {
    try {
      const response = await axios.get("/api/ex101/member", {
        params: {
          search,
          sort,
        },
      });
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this member?")) {
      try {
        await axios.delete(`/api/ex101/member?id=${id}`);
        setMembers(members.filter((member) => member.id !== id));
      } catch (error) {
        console.error("Error deleting member:", error);
      }
    }
  };

  const handleCreate = async () => {
    const updatedFormData = { ...formData, prefix };
    if (!formData.first_name || !formData.last_name) {
      alert("First name and Last name are required!");
      return;
    }
    try {
      const response = await axios.post("/api/ex101/member", updatedFormData);
      setMembers([...members, response.data]);
      setFormData({
        prefix: "",
        first_name: "",
        last_name: "",
        dob: "",
        profile_picture: "",
      });
    } catch (error) {
      console.error("Error creating member:", error);
    }
  };

  const handleEdit = (member: any) => {
    setEditMember(true);
    setEditMemberData(member);
    const formattedDob = new Date(member.dob).toISOString().split("T")[0];
    setFormData({
      prefix: member.prefix,
      first_name: member.first_name,
      last_name: member.last_name,
      dob: formattedDob,
      profile_picture: member.profile_picture,
    });
  };

  const handleUpdate = async () => {
    const updatedFormData = { ...formData, prefix, id: editMemberData.id }; // เพิ่ม id ใน body
    console.log("Updating member with ID:", updatedFormData.id); // ตรวจสอบค่า ID
    try {
      const response = await axios.patch(
        "/api/ex101/member", // ไม่ต้องระบุ id ใน URL
        updatedFormData
      );
      setMembers(
        members.map((member) =>
          member.id === updatedFormData.id ? response.data : member
        )
      );
      setEditMember(false); // ปิด Popup หลังการอัพเดต
    } catch (error) {
      console.error("Error updating member:", error);
    }
  };

    // useEffect ที่จะดึงข้อมูลสมาชิกใหม่หลังจากมีการอัพเดต
    useEffect(() => {
      if (!editMember) {
        fetchMembers(); // รีเฟรชข้อมูลสมาชิกใหม่
      }
    }, [editMember]); // ทำงานเมื่อ editMember เปลี่ยนค่า
    
  useEffect(() => {
    fetchMembers();
  }, [search, sort]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Members List</h1>
      <div className="w-full flex mb-6">
        <div className="flex gap-5 w-full">
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
              className="px-4 py-2 border rounded-lg"
            />
          </div>
          <div className="mb-4 flex">
            <button
              onClick={() => setSort(sort === "asc" ? "desc" : "asc")}
              className="px-4 py-2 bg-blue-500 active:bg-blue-800 text-white rounded-lg"
            >
              Sort by Age ({sort === "asc" ? "Ascending" : "Descending"})
            </button>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="mb-4 px-4 py-2 bg-green-500 active:bg-green-800 text-white rounded-lg"
        >
          Create
        </button>
      </div>

       {/* ฟอร์มสร้างสมาชิก */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Create New Member</h2>
        <div className="grid grid-cols-2 gap-4">
          <select
            id="prefix"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)} 
            className="px-4 py-2 border rounded-lg"
          >
            <option value="นาย">นาย</option>
            <option value="นางสาว">นางสาว</option>
            <option value="นาง">นาง</option>
          </select>

          <input
            type="text"
            placeholder="First Name"
            value={formData.first_name}
            onChange={(e) =>
              setFormData({ ...formData, first_name: e.target.value })
            }
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={(e) =>
              setFormData({ ...formData, last_name: e.target.value })
            }
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Profile Picture URL"
            value={formData.profile_picture}
            onChange={(e) =>
              setFormData({ ...formData, profile_picture: e.target.value })
            }
            className="px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Edit Form Popup */}
      {editMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Edit Member</h2>
            <div className="grid grid-cols-2 gap-4">
              <select
                id="prefix"
                value={formData.prefix}
                onChange={(e) =>
                  setFormData({ ...formData, prefix: e.target.value })
                }
                className="px-4 py-2 border rounded-lg"
              >
                <option value="นาย">นาย</option>
                <option value="นางสาว">นางสาว</option>
                <option value="นาง">นาง</option>
              </select>

              <input
                type="text"
                placeholder="First Name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="date"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Profile Picture URL"
                value={formData.profile_picture}
                onChange={(e) =>
                  setFormData({ ...formData, profile_picture: e.target.value })
                }
                className="px-4 py-2 border rounded-lg"
              />
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Update
              </button>
              <button
                onClick={() => setEditMember(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member List Table */}
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 text-left border-b">ลำดับ</th>
            <th className="px-4 py-2 text-left border-b">Profile Picture</th>
            <th className="px-4 py-2 text-left border-b">Prefix</th>
            <th className="px-4 py-2 text-left border-b">First Name</th>
            <th className="px-4 py-2 text-left border-b">Last Name</th>
            <th className="px-4 py-2 text-left border-b">Age</th>
            <th className="py-2 text-left border-b">Action</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr key={member.id} className="border-b">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">
                <img
                  src={member.profile_picture}
                  alt={`${member.first_name} ${member.last_name}`}
                  className="w-16 h-16 object-cover rounded-full"
                />
              </td>
              <td className="px-4 py-2">{member.prefix}</td>
              <td className="px-4 py-2">{member.first_name}</td>
              <td className="px-4 py-2">{member.last_name}</td>
              <td className="px-4 py-2">{member.age} ปี</td>
              <td className="py-2">
                <button
                  type="button"
                  className="text-blue-500 active:text-blue-800 mr-5 underline"
                  onClick={() => handleDelete(member.id)}
                >
                  ลบ
                </button>
                <button
                  type="button"
                  className="text-blue-500 active:text-blue-800 underline"
                  onClick={() => handleEdit(member)}
                >
                  แก้ไข
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
